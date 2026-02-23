// ========================== IMPORTS ==========================
import Story from "../models/Story.js";
import imagekit from "../configs/imageKit.js";
import fs from "fs"; // (currently unused)
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";


// ========================== ADD USER STORY ==========================
/**
 * Create a new story (text / image / video)
 */
export const addUserStory = async (req, res) => {
  try {

    // ================= AUTH =================
    const { userId } = req.auth();

    // ================= INPUT =================
    const { content, media_type, background_color } = req.body;
    const media = req.file;

    console.log("MEDIA:", media); // Debug


    let media_url = "";


    // ================= MEDIA UPLOAD =================
    // Only upload if media type is image or video
    if ((media_type === "image" || media_type === "video") && media) {

      // Validate file buffer
      if (!media.buffer) {
        return res.status(400).json({
          success: false,
          message: "Invalid file",
        });
      }

      // Convert buffer to base64
      const base64 = media.buffer.toString("base64");

      // Upload to ImageKit
      const response = await imagekit.upload({
        file: base64,
        fileName: media.originalname,
        folder: "stories",
      });

      media_url = response.url;
    }


    // ================= SAVE STORY =================
    const story = await Story.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
    });


    // ================= SCHEDULE DELETE =================
    // Send event to Inngest to delete story later
    await inngest.send({
      name: "/app/story.delete",
      data: { storyId: story._id },
    });


    // ================= RESPONSE =================
    res.status(201).json({
      success: true,
      message: "Story added successfully",
      story,
    });

  } catch (err) {

    console.error("STORY ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ========================== GET STORIES ==========================
/**
 * Fetch stories for feed (self + connections + following)
 */
export const getStories = async (req, res) => {
  try {

    // ================= AUTH =================
    const { userId } = req.auth();


    // ================= GET USER =================
    const user = await User.findById(userId);

    // Validate user existence
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // ================= BUILD USER LIST =================
    // Include:
    // - self
    // - connections
    // - following
    const userIds = [
      userId,
      ...(user.connections || []),
      ...(user.following || []),
    ];


    // ================= FETCH STORIES =================
    const stories = await Story.find({
      user: { $in: userIds },
    })
      .populate("user")
      .sort({ createdAt: -1 });


    // ================= RESPONSE =================
    res.json({
      success: true,
      data: stories,
    });

  } catch (err) {

    console.error("GET STORIES ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};