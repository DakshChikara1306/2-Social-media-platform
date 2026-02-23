// ========================== IMPORTS ==========================
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import Connection from "../models/Connection.js";
import Post from "../models/Post.js";
import { inngest } from "../inngest/index.js";


// ========================== GET USER DATA ==========================
/**
 * Get current authenticated user data
 */
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();

    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ========================== UPDATE USER ==========================
/**
 * Update user profile (text + images)
 */
export const updateUserData = async (req, res) => {
  try {

    // ================= AUTH =================
    const { userId } = req.auth();

    // ================= INPUT =================
    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);

    // Validate user
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // ================= USERNAME VALIDATION =================
    if (!username) username = tempUser.username;

    // Check if username already exists
    if (tempUser.username !== username) {
      const user = await User.findOne({ username });
      if (user) username = tempUser.username;
    }


    // ================= UPDATE DATA =================
    const updatedData = {
      username,
      bio,
      location,
      full_name,
    };


    // ================= FILES =================
    const profile = req.files?.profile?.[0];
    const cover = req.files?.cover?.[0];


    // ================= PROFILE IMAGE =================
    if (profile) {

      console.log("PROFILE FILE:", profile);

      if (!profile.buffer) {
        return res.status(400).json({
          success: false,
          message: "Invalid profile file",
        });
      }

      const response = await imagekit.upload({
        file: profile.buffer.toString("base64"),
        fileName: profile.originalname,
        folder: "profiles",
      });

      if (!response || !response.url) {
        console.log("UPLOAD FAILED:", response);
        return res.status(500).json({
          success: false,
          message: "Profile upload failed",
        });
      }

      updatedData.profile_picture = response.url;
    }


    // ================= COVER IMAGE =================
    if (cover) {

      console.log("COVER FILE:", cover);

      if (!cover.buffer) {
        return res.status(400).json({
          success: false,
          message: "Invalid cover file",
        });
      }

      const response = await imagekit.upload({
        file: cover.buffer.toString("base64"),
        fileName: cover.originalname,
        folder: "covers",
      });

      if (!response || !response.url) {
        console.log("COVER UPLOAD FAILED:", response);
        return res.status(500).json({
          success: false,
          message: "Cover upload failed",
        });
      }

      updatedData.cover_photo = response.url;
    }


    // ================= SAVE USER =================
    const user = await User.findByIdAndUpdate(
      userId,
      updatedData,
      { new: true }
    );


    // ================= RESPONSE =================
    res.json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ========================== DISCOVER USERS ==========================
/**
 * Search users by keyword
 */
export const discoverUsers = async (req, res) => {
  try {

    const { userId } = req.auth();
    const { input } = req.body;

    // Return empty if no input
    if (!input) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Escape regex special characters
    const safeInput = input.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // ================= SEARCH =================
    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { username: { $regex: safeInput, $options: "i" } },
        { email: { $regex: safeInput, $options: "i" } },
        { location: { $regex: safeInput, $options: "i" } },
        { full_name: { $regex: safeInput, $options: "i" } },
      ],
    }).limit(20);


    // ================= RESPONSE =================
    res.json({
      success: true,
      data: users,
    });

  } catch (err) {

    console.error("DISCOVER ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ========================== FOLLOW USER ==========================
export const followUser = async (req, res) => {
  try {

    const { userId } = req.auth();
    const { id } = req.body;

    // Prevent self-follow
    if (userId === id) {
      return res.json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent duplicate follow
    if (user.following.map(String).includes(id)) {
      return res.json({
        success: false,
        message: "You are already following this user",
      });
    }

    user.following.push(id);
    toUser.followers.push(userId);

    await user.save();
    await toUser.save();

    res.json({
      success: true,
      message: "Now you are following this user",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================== UNFOLLOW USER ==========================
export const unfollowUser = async (req, res) => {
  try {

    const { userId } = req.auth();
    const { id } = req.body;

    // Prevent self-unfollow
    if (userId === id) {
      return res.json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already following
    if (!user.following.map(String).includes(id)) {
      return res.json({
        success: false,
        message: "You are not following this user",
      });
    }

    // Remove follow
    user.following = user.following.filter(
      (followingId) => followingId.toString() !== id
    );

    toUser.followers = toUser.followers.filter(
      (followerId) => followerId.toString() !== userId
    );

    await user.save();
    await toUser.save();

    res.json({
      success: true,
      message: "You have unfollowed this user",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================== SEND CONNECTION REQUEST ==========================
export const sendConnectionRequest = async (req, res) => {
  try {

    const { userId } = req.auth();
    const { id } = req.body;

    // ================= RATE LIMIT =================
    const last24Hours = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    );

    const connectionRequests = await Connection.find({
      from_user_id: userId,
      createdAt: { $gt: last24Hours },
    });

    if (connectionRequests.length >= 20) {
      return res.json({
        success: false,
        message:
          "You have sent too many connection requests. Please try again later.",
      });
    }


    // ================= CHECK EXISTING =================
    const connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });


    if (!connection) {

      const newConnection = await Connection.create({
        from_user_id: userId,
        to_user_id: id,
      });

      // Trigger async event
      await inngest.send({
        name: "/app/connection-request",
        data: { connectionId: newConnection._id },
      });

      return res.json({
        success: true,
        message: "Connection request sent successfully",
      });
    }

    if (connection && connection.status === "accepted") {
      return res.json({
        success: false,
        message: "You are already connected with this user",
      });
    }

    return res.json({
      success: false,
      message: "Connection request pending",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ========================== GET USER CONNECTIONS ==========================
export const getUserConnections = async (req, res) => {
  try {

    const { userId } = req.auth();

    const user = await User.findById(userId).populate(
      "connections following followers"
    );

    const connections = user.connections;
    const followers = user.followers;
    const following = user.following;

    // Pending requests
    const pendingConnections = (
      await Connection.find({
        to_user_id: userId,
        status: "pending",
      }).populate("from_user_id")
    ).map((conn) => conn.from_user_id);


    res.json({
      success: true,
      data: {
        connections,
        followers,
        following,
        pendingConnections,
      },
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ========================== ACCEPT CONNECTION ==========================
export const acceptConnectionRequest = async (req, res) => {
  try {

    const { userId } = req.auth();
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    });

    if (!connection) {
      return res.json({
        success: false,
        message: "Connection request not found",
      });
    }

    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.connections.push(userId);
    await toUser.save();

    connection.status = "accepted";
    await connection.save();

    res.json({
      success: true,
      message: "Connection request accepted successfully",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ========================== GET USER PROFILE ==========================
export const getUserProfiles = async (req, res) => {
  try {

    const { profileId } = req.body;

    const profile = await User.findById(profileId);

    if (!profile) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch posts
    const posts = await Post.find({ user: profileId })
      .sort({ createdAt: -1 })
      .populate("user");

    console.log("ProfileId:", profileId);
    console.log("Posts found:", posts.length);

    res.json({
      success: true,
      data: { profile, posts },
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};