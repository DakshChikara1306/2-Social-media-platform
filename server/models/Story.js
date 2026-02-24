import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  user: { type: String, ref: "User" },
  content: { type: String },
  media_url: { type: String },
  media_type: { type: String, enum: ["image", "video", "text"] },
  views_count: [{ type: String, ref: "User" }],
  background_color: { type: String },
}, { timestamps: true });

// ✅ TTL index (auto delete after 24h)
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Story = mongoose.model("Story", storySchema);

export default Story;