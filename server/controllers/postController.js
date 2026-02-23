// ========================== IMPORTS ==========================
import fs from "fs"; // (currently unused)
import imageKit from "../configs/imageKit.js";
import Post from "../models/Post.js";
import User from "../models/User.js";


// ========================== ADD POST ==========================
/**
 * Create a new post (text / image / mixed)
 */
export const addPost = async (req, res) => {
  try {

    // ================= AUTH =================
    const { userId } = req.auth();

    // ================= INPUT =================
    const { content, post_type } = req.body;
    const images = req.files;

    let image_urls = [];


    // ================= IMAGE UPLOAD =================
    if (images && images.length > 0) {

      image_urls = await Promise.all(
        images.map(async (image) => {

          // Get file buffer
          const fileBuffer = image.buffer;

          // Upload to ImageKit
          const response = await imageKit.upload({
            file: fileBuffer,
            fileName: image.originalname,
            folder: "posts",
          });

          // Generate optimized URL
          return imageKit.url({
            path: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: "1280" },
            ],
          });
        })
      );

    }


    // ================= SAVE POST =================
    await Post.create({
      user: userId,
      content,
      image_url: image_urls,
      post_type,
    });


    // ================= RESPONSE =================
    res.json({
      message: "Post created successfully",
      success: true,
    });

  } catch (error) {

    console.error("POST ERROR:", error);

    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};


// ========================== GET FEED POSTS ==========================
/**
 * Get posts for feed (self + connections + following)
 */
export const getFeedPosts = async (req, res) => {
  try {

    // ================= AUTH =================
    const { userId } = req.auth();

    // ================= GET USER =================
    const user = await User.findById(userId);

    // Combine all relevant user IDs
    const userIds = [
      userId,
      ...user.connections,
      ...user.following,
    ];


    // ================= FETCH POSTS =================
    const posts = await Post.find({
      user: { $in: userIds },
    })
      .sort({ createdAt: -1 })
      .populate("user");


    // ================= RESPONSE =================
    res.json({
      posts,
      success: true,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};


// ========================== LIKE / UNLIKE POST ==========================
/**
 * Toggle like on a post
 */
export const likePost = async (req, res) => {
  try {

    // ================= AUTH =================
    const { userId } = req.auth();

    // ================= INPUT =================
    const { postId } = req.body;

    // ================= VALIDATION =================
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }


    // ================= FIND POST =================
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }


    // ================= TOGGLE LIKE =================
    if (post.likes_count.includes(userId)) {

      // Remove like
      post.likes_count = post.likes_count.filter(
        (id) => id !== userId
      );

    } else {

      // Add like
      post.likes_count.push(userId);
    }


    // ================= SAVE =================
    await post.save();


    // ================= RESPONSE =================
    res.json({
      success: true,
      likes: post.likes_count,
    });

  } catch (error) {

    console.error("LIKE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};