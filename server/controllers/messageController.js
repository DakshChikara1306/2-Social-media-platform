// ========================== IMPORTS ==========================
import Message from "../models/Message.js";
import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";

// ========================== IN-MEMORY CONNECTION STORE ==========================
// Stores active SSE connections for each user
// Structure: { userId: [res, res, ...] }
let connections = {};


// ========================== SSE CONTROLLER ==========================
/**
 * Establish Server-Sent Events (SSE) connection
 * Keeps connection alive and streams real-time data
 */
export const sseController = (req, res) => {

  const { userId } = req.params;

  // ================= CORS HEADERS =================
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.FRONTEND_URL
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // ================= SSE HEADERS =================
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // ================= STORE CONNECTION =================
  if (!connections[userId]) connections[userId] = [];
  connections[userId].push(res);


  // ================= HEARTBEAT =================
  // Keeps connection alive (every 20 sec)
  const interval = setInterval(() => {
    res.write(":\n\n"); // SSE comment (heartbeat)
  }, 20000);


  // ================= CLEANUP =================
  req.on("close", () => {
    clearInterval(interval);

    // Remove closed connection
    connections[userId] = connections[userId].filter(
      (r) => r !== res
    );
  });
};


// ========================== HELPER FUNCTION ==========================
/**
 * Send data to all active SSE connections of a user
 */
const sendToUser = (userId, data) => {

  if (!connections[userId]) return;

  connections[userId].forEach((res) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};


// ========================== SEND MESSAGE ==========================
/**
 * Send a message (text or image)
 */
export const sendMessage = async (req, res) => {
  try {

    // ================= AUTH =================
    const { userId } = req.auth();

    // ================= INPUT =================
    const { to_user_id, text } = req.body;
    const file = req.file;

    console.log("FILE:", file);

    // ================= VALIDATION =================
    if (!text && !file) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    let media_url = null;
    let message_type = "text";


    // ================= FILE UPLOAD =================
    // If file exists, upload to ImageKit
    if (file && file.buffer) {

      const base64 = file.buffer.toString("base64");

      const uploadRes = await imagekit.upload({
        file: base64,
        fileName: file.originalname,
      });

      media_url = uploadRes.url;
      message_type = "image";
    }


    // ================= SAVE MESSAGE =================
    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      media_url,
      message_type,
    });


    // ================= SSE PAYLOAD =================
    const payload = {
      type: "NEW_MESSAGE",
      message,
    };


    // ================= REAL-TIME PUSH =================
    sendToUser(to_user_id, payload); // receiver
    sendToUser(userId, payload);     // sender


    // ================= RESPONSE =================
    res.json({
      success: true,
      message,
    });

  } catch (error) {

    console.error("SEND ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================== GET CHAT MESSAGES ==========================
/**
 * Get messages between two users
 */
export const getChatMessages = async (req, res) => {
  try {

    const { userId } = req.auth();
    const { to_user_id } = req.body;

    // ================= FETCH MESSAGES =================
    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    }).sort({ createdAt: 1 });


    // ================= RESPONSE =================
    res.json({
      success: true,
      messages,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================== GET RECENT MESSAGES ==========================
/**
 * Get last message for each conversation (recent chats list)
 */
export const getUserRecentMessages = async (req, res) => {
  
  try {
    const { userId } = req.auth();

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { from_user_id: userId },
            { to_user_id: userId },
          ],
        },
      },
      { $sort: { createdAt: -1 } },

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

      { $replaceRoot: { newRoot: "$lastMessage" } },
      { $sort: { createdAt: -1 } },
      
    ]);


    // ===== MANUAL POPULATION =====
   const populatedMessages = await Promise.all(
  messages.map(async (msg) => {

    const fromUser = await User.findById(msg.from_user_id);
    const toUser = await User.findById(msg.to_user_id);

    return {
      ...msg,

      from_user_id: fromUser
        ? {
            _id: fromUser._id,
            full_name: fromUser.full_name,
            profile_picture: fromUser.profile_picture,
          }
        : {
            _id: msg.from_user_id,
            full_name: "User",
            profile_picture: "/default.png",
          },

      to_user_id: toUser
        ? {
            _id: toUser._id,
            full_name: toUser.full_name,
            profile_picture: toUser.profile_picture,
          }
        : {
            _id: msg.to_user_id,
            full_name: "User",
            profile_picture: "/default.png",
          },
    };
  })
);

    res.json({
      success: true,
      messages: populatedMessages,
    });
    

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};