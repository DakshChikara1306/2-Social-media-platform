// ========================== IMPORTS ==========================
import express from "express";

// Controllers
import {
  getChatMessages,
  sseController,
  sendMessage,
} from "../controllers/messageController.js";

// Configs
import { upload } from "../configs/multer.js";

// Middleware
import { protect } from "../middlewares/auth.js";


// ========================== ROUTER ==========================
const router = express.Router();


// ========================== SSE ROUTE ==========================
/**
 * Server-Sent Events endpoint
 * Establishes real-time connection for messages
 * 
 * ⚠️ Currently NOT protected (no auth middleware)
 */
router.get("/sse/:userId", sseController);


// ========================== SEND MESSAGE ==========================
/**
 * Send message (text or image)
 * 
 * - Uses multer for file upload
 * - Requires authentication
 */
router.post(
  "/send",
  upload.single("file"), // handle single file upload
  protect,               // auth middleware
  sendMessage            // controller
);


// ========================== GET MESSAGES ==========================
/**
 * Fetch chat messages between users
 * 
 * - Requires authentication
 */
router.post(
  "/get",
  protect,
  getChatMessages
);


// ========================== EXPORT ==========================
export default router;