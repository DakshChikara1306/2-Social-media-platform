import Message from "../models/Message.js";
import imagekit from "../configs/imageKit.js";

let connections = {}; // { userId: [res, res] }

// =======================
// SSE CONNECTION
// =======================
export const sseController = (req, res) => {
  const { userId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // store multiple connections per user
  if (!connections[userId]) connections[userId] = [];
  connections[userId].push(res);

  // initial ping
  res.write("data: Connected\n\n");

  // keep alive (important for SSE)
  const interval = setInterval(() => {
    res.write(":\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(interval);
    connections[userId] = connections[userId].filter(r => r !== res);
  });
};

// helper to send data
const sendToUser = (userId, data) => {
  if (connections[userId]) {
    connections[userId].forEach(res => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
};

// =======================
// SEND MESSAGE
// =======================
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
    const file = req.file;

    // validation
    if (!to_user_id) {
      return res.status(400).json({ success: false, message: "Receiver required" });
    }

    if (!text && !file) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    let media_url = null;
    let message_type = "text";

    // =====================
    // IMAGE UPLOAD
    // =====================
    if (file) {
      if (!file.mimetype.startsWith("image")) {
        return res.status(400).json({ success: false, message: "Only image allowed" });
      }

      try {
        const base64File = file.buffer.toString("base64");

        const uploadRes = await imagekit.upload({
          file: base64File,
          fileName: file.originalname,
          useUniqueFileName: true,
          folder: "/messages",
        });

        message_type = "image";

        media_url = imagekit.url({
          path: uploadRes.filePath,
          transformation: [
            { quality: "auto" },
            { format: "webp" },
            { width: "1280" },
          ],
        });
      } catch (err) {
        console.error("Upload error:", err);
        return res.status(500).json({ success: false, message: "Image upload failed" });
      }
    }

    // =====================
    // SAVE MESSAGE
    // =====================
    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    // send to receiver
    sendToUser(to_user_id, { type: "NEW_MESSAGE", message });

    res.json({ success: true, message });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// GET CHAT MESSAGES
// =======================
export const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id } = req.body;

    if (!to_user_id) {
      return res.status(400).json({ success: false, message: "Receiver required" });
    }

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    }).sort({ createdAt: 1 }); // oldest first

    // mark as seen
    await Message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId, seen: false },
      { seen: true }
    );

    // notify sender that messages are seen
    sendToUser(to_user_id, {
      type: "SEEN",
      from_user_id: userId,
    });

    res.json({ success: true, messages });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// GET RECENT MESSAGES (INBOX)
// =======================
export const getUserRecentMessages = async (req, res) => {
  try {
    const { userId } = req.auth();

    // get last message with each user
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { from_user_id: userId },
            { to_user_id: userId },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$from_user_id", userId] },
              "$to_user_id",
              "$from_user_id",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$lastMessage" },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.json({ success: true, messages });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================
// DELETE MESSAGE (ONLY SENDER)
// =======================
export const deleteMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (String(message.from_user_id) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await Message.findByIdAndDelete(id);

    // notify receiver
    sendToUser(message.to_user_id, {
      type: "DELETE",
      id,
    });

    res.json({ success: true, id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};