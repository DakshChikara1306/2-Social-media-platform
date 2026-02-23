// ========================== IMPORTS ==========================
import express from "express";

import { upload } from "../configs/multer.js";
import { protect } from "../middlewares/auth.js";

import {
  addUserStory,
  getStories,
} from "../controllers/storyController.js";


// ========================== ROUTER ==========================
const storyRouter = express.Router();


// ========================== CREATE STORY ==========================
/**
 * Create a new story
 * Supports image / video upload
 */
storyRouter.post(
  "/create",
  upload.single("media"), // handle file upload
  protect,                // auth middleware
  addUserStory            // controller
);


// ========================== GET STORIES ==========================
/**
 * Get stories for user + connections
 */
storyRouter.get(
  "/get",
  protect,
  getStories
);


// ========================== EXPORT ==========================
export default storyRouter;