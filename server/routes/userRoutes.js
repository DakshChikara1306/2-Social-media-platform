// ========================== IMPORTS ==========================
import express from "express";

import {
  discoverUsers,
  followUser,
  getUserData,
  unfollowUser,
  updateUserData,
  sendConnectionRequest,
  acceptConnectionRequest,
  getUserConnections,
  getUserProfiles,
} from "../controllers/userController.js";

import { getUserRecentMessages } from "../controllers/messageController.js";

import { protect } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";


// ========================== ROUTER ==========================
const userRouter = express.Router();


// ========================== USER ==========================

/**
 * Get current logged-in user data
 */
userRouter.get(
  "/data",
  protect,
  getUserData
);

/**
 * Update user profile (profile + cover image)
 */
userRouter.post(
  "/update",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  protect,
  updateUserData
);


// ========================== DISCOVER ==========================

/**
 * Search users
 */
userRouter.post(
  "/discover",
  protect,
  discoverUsers
);


// ========================== FOLLOW ==========================

/**
 * Follow a user
 */
userRouter.post(
  "/follow",
  protect,
  followUser
);

/**
 * Unfollow a user
 */
userRouter.post(
  "/unfollow",
  protect,
  unfollowUser
);


// ========================== CONNECTION ==========================

/**
 * Send connection request
 */
userRouter.post(
  "/connect",
  protect,
  sendConnectionRequest
);

/**
 * Accept connection request
 */
userRouter.post(
  "/accept",
  protect,
  acceptConnectionRequest
);

/**
 * Get all connections data
 */
userRouter.get(
  "/connections",
  protect,
  getUserConnections
);


// ========================== PROFILE ==========================

/**
 * Get user profile + posts
 */
userRouter.post(
  "/profiles",
  getUserProfiles
);


// ========================== MESSAGES ==========================

/**
 * Get recent messages (last chat per user)
 */
userRouter.get(
  "/recent-messages",
  protect,
  getUserRecentMessages
);


// ========================== EXPORT ==========================
export default userRouter;