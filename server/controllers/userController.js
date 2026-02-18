import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";

// get user
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth;

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
    const { userId } = req.auth;

    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);

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

    // files
    const profile = req.files?.profile?.[0];
    const cover = req.files?.cover?.[0];

    if (profile) {
      const response = await imagekit.upload({
        file: profile.buffer,
        fileName: profile.originalname,
      });

      updatedData.profile_picture = response.url;
    }

    if (cover) {
      const response = await imagekit.upload({
        file: cover.buffer,
        fileName: cover.originalname,
      });

      updatedData.cover_photo = response.url;
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
