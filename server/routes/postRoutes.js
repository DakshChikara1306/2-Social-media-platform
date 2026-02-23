// ========================== IMPORTS ==========================
import express from "express";

import { upload } from "../configs/multer.js";
import { protect } from "../middlewares/auth.js";

import {
  addPost,
  getFeedPosts,
  likePost,
} from "../controllers/postController.js";


// ========================== ROUTER ==========================
const postRouter = express.Router();


// ========================== ADD POST ==========================
/**
 * Create new post
 * Supports up to 4 images
 */
postRouter.post(
  "/add",

  // 🔥 Handle multer errors manually
  (req, res, next) => {
    upload.array("images", 4)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },

  // 🔐 Auth middleware
  protect,

  // 🎯 Controller
  addPost
);


// ========================== GET FEED ==========================
/**
 * Get feed posts
 */
postRouter.get(
  "/feed",
  protect,
  getFeedPosts
);


// ========================== LIKE POST ==========================
/**
 * Like / Unlike post
 */
postRouter.post(
  "/like",
  protect,
  likePost
);


// ========================== EXPORT ==========================
export default postRouter;