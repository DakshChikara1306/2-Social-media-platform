import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import fs from "fs";
import Connection from '../models/Connection.js';


// get user
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// update user
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();

    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);

    // 🔴 FIX: handle null user
    if (!tempUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!username) username = tempUser.username;

    if (tempUser.username !== username) {
      const user = await User.findOne({ username });
      if (user) username = tempUser.username;
    }

    const updatedData = {
      username,
      bio,
      location,
      full_name,
    };

    // 🔴 FIX: safe access (avoid crash)
    const profile = req.files?.profile?.[0];
    const cover = req.files?.cover?.[0];

    

    // profile upload
    if (profile) {
      const buffer = fs.readFileSync(profile.path);

      // 🔴 FIX: correct method
      const response = await imagekit.upload({
  file: buffer.toString("base64"),
  fileName: profile.originalname,
});
      

      // 🔴 FIX: use response url
      updatedData.profile_picture = response.url;
      if (!response || !response.url) {
  console.log("UPLOAD FAILED:", response);
}

      // 🔴 FIX: delete local file
      fs.unlinkSync(profile.path);
    }

    // cover upload
    if (cover) {
      const buffer = fs.readFileSync(cover.path);

     const response = await imagekit.upload({
  file: buffer.toString("base64"),
  fileName: cover.originalname,
});
      console.log("COVER UPLOAD RESPONSE:", response);
      updatedData.cover_photo = response.url;

      fs.unlinkSync(cover.path);
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    res.json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Find users
export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    // 🔴 FIX: prevent regex injection
    const safeInput = input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(safeInput, "i") },
        { email: new RegExp(safeInput, "i") },
        { location: new RegExp(safeInput, "i") },
        { full_name: new RegExp(safeInput, "i") },
      ],
    });

    // 🔴 FIX: ObjectId comparison
    const filteredUsers = allUsers.filter(
      (user) => user._id.toString() !== userId
    );

    res.json({
      success: true,
      data: filteredUsers,
      message: "Users fetched successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// follow user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    if (userId === id) {
      return res.json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // 🔴 FIX: compare properly
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

    res.json({ success: true, message: "Now you are following this user" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    if (userId === id) {
      return res.json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.following.map(String).includes(id)) {
      return res.json({
        success: false,
        message: "You are not following this user",
      });
    }

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
    res.status(500).json({ success: false, message: error.message });
  }
};

// send connection request
export const sendConnectionRequest = async (req, res) => {
  try{
    const { userId } = req.auth();
    const { id } = req.body;

    //check if user has sent more than 20 connection requests in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const connectionRequests = await Connection.find({ from_user_id: userId, createdAt: { $gt: last24Hours } });
    if(connectionRequests.length >= 20){
      return res.json({ success: false, message: "You have sent too many connection requests. Please try again later." });
    }
    // check if users are already connected
    const connection = await Connection.findOne({ 
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId }
      ]
    });
    if(!connection){
      await Connection.create({ from_user_id: userId, to_user_id: id });
      res.json({ success: true, message: "Connection request sent successfully" });
    }else if(connection && connection.status === "accepted"){
      return res.json({ success: false, message: "You are already connected with this user" });
    }
    return res.json({ success: false, message: "Connection request pending" });

  }catch(err){
    res.status(500).json({ success: false, message: err.message });
  }
}

// get user connections
export const getUserConnections = async (req, res) => {
  try{
    const { userId } = req.auth();
    const user = await User.findById(userId).populate('connections following followers'); 
    const connections = user.connections
    const followers = user.followers
    const following = user.following
    const pendingConnections = (await Connection.find({ to_user_id: userId, status: "pending" }).populate('from_user_id')).map(conn => conn.from_user_id);
    
    res.json({ success: true, data: { connections, followers, following, pendingConnections } });
  }catch(err){
    res.status(500).json({ success: false, message: err.message });
  }
} 

// accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try{
    const { userId } = req.auth();
    const { id } = req.body;

    const connection = await Connection.findOne({ from_user_id: id, to_user_id: userId});
    if(!connection){
      return res.json({ success: false, message: "Connection request not found" });
    }
    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save();
    
    const toUser = await User.findById(id);
    toUser.connections.push(userId);
    await toUser.save();

    connection.status = "accepted";
    await connection.save();
    
    res.json({ success: true, message: "Connection request accepted successfully" });
  }catch(err){
    res.status(500).json({ success: false, message: err.message });
  }
} 