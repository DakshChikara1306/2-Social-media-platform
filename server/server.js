// ========================== IMPORTS ==========================
import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./configs/db.js";

// inngest
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";

// auth
import { clerkMiddleware } from "@clerk/express";

// routes
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
import messageRouter from "./routes/messageRoutes.js";


// ========================== APP INIT ==========================
const app = express();


// ========================== DATABASE ==========================
await connectDB();


// ========================== GLOBAL MIDDLEWARE ==========================
app.use(cors());              // enable CORS
app.use(express.json());      // parse JSON body
app.use(clerkMiddleware());  // authentication


// ========================== HEALTH CHECK ==========================
app.get("/", (req, res) => {
  res.send("server is running");
});


// ========================== INNGEST ==========================
app.use(
  "/api/inngest",
  serve({ client: inngest, functions })
);


// ========================== API ROUTES ==========================
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);


// ========================== SERVER ==========================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});