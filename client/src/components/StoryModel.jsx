// ========================== IMPORTS ==========================
import React, { useState } from "react";

// Icons
import { ArrowLeft, Sparkle, TextIcon, Upload } from "lucide-react";

// Utilities
import { toast } from "react-hot-toast";

// API & Auth
import api from "../api/axios";
import { useAuth } from "@clerk/clerk-react";


// ========================== COMPONENT ==========================
const StoryModel = ({ setShowModel, fetchStories }) => {

  // ========================== AUTH ==========================
  const { getToken } = useAuth();


  // ========================== CONSTANTS ==========================
  // Available background colors for text stories
  const bgColors = [
    "#4f46e5",
    "#7c3aed",
    "#db2777",
    "#e11d48",
    "#ea8a04",
    "#bd9488",
  ];

  // Limits for media uploads
  const MAX_VIDEO_DURATION = 60; // seconds
  const MAX_VIDEO_SIZE_MB = 50;


  // ========================== STATE ==========================
  // Story mode: "text" or "media"
  const [mode, setMode] = useState("text");

  // Selected background color (for text mode)
  const [background, setBackground] = useState(bgColors[0]);

  // Story text content
  const [text, setText] = useState("");

  // Uploaded media file
  const [media, setMedia] = useState(null);

  // Preview URL for media
  const [previewUrl, setPreviewUrl] = useState(null);


  // ========================== HANDLERS ==========================
  /**
   * Handle media upload (image/video)
   */
  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ================= VIDEO HANDLING =================
    if (file.type.startsWith("video")) {

      // Validate file size
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        return toast.error(`Max video size is ${MAX_VIDEO_SIZE_MB}MB`);
      }

      // Create video element to check duration
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);

        // Validate duration
        if (video.duration > MAX_VIDEO_DURATION) {
          toast.error(`Video must be under ${MAX_VIDEO_DURATION} sec`);
        } else {
          setMedia(file);
          setPreviewUrl(URL.createObjectURL(file));
          setMode("media"); // switch to media mode
          setText("");
        }
      };
    }

    // ================= IMAGE HANDLING =================
    else if (file.type.startsWith("image")) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMode("media"); // switch to media mode
      setText("");
    }

    // ================= INVALID FILE =================
    else {
      toast.error("Only image/video allowed");
    }
  };


  /**
   * Create story API call
   */
  const handleCreateStory = async () => {
    try {
      // Determine media type
      const media_type =
        mode === "media"
          ? media?.type.startsWith("image")
            ? "image"
            : "video"
          : "text";

      // ================= VALIDATION =================
      if (media_type === "text" && !text.trim()) {
        throw new Error("Please enter some text");
      }

      // ================= FORM DATA =================
      const formData = new FormData();
      formData.append("content", text);
      formData.append("media_type", media_type);
      formData.append("background_color", background);

      // Attach media if exists
      if (media) {
        formData.append("media", media);
      }

      // ================= API REQUEST =================
      const token = await getToken();

      const { data } = await api.post("/api/story/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ================= RESPONSE HANDLING =================
      if (!data.success) {
        throw new Error(data.message);
      }

      // ================= SUCCESS =================
      toast.success("Story created");

      // Close modal
      setShowModel(false);

      // Refresh stories
      fetchStories && fetchStories();

    } catch (error) {
      console.error(error);
      throw new Error(error.message || "Failed to create story");
    }
  };


  /**
   * Handle submit with toast promise
   */
  const handleSubmit = () => {
    toast.promise(handleCreateStory(), {
      loading: "Saving...",
      success: "Story created!",
      error: (e) => e.message || "Failed",
    });
  };


  // ========================== JSX ==========================
  return (
    <div className="fixed inset-0 z-50 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-4">

          {/* Back Button */}
          <button onClick={() => setShowModel(false)} className="p-2">
            <ArrowLeft />
          </button>

          {/* Title */}
          <h2 className="text-lg font-semibold">
            Create Story
          </h2>

          {/* Spacer */}
          <span className="w-10" />

        </div>


        {/* ================= PREVIEW ================= */}
        <div
          className="rounded-lg h-96 flex items-center justify-center"
          style={{ backgroundColor: background }}
        >

          {/* -------- TEXT MODE -------- */}
          {mode === "text" && (
            <textarea
              className="bg-transparent w-full h-full p-6 text-lg resize-none outline-none"
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}

          {/* -------- MEDIA MODE -------- */}
          {mode === "media" && previewUrl && (
            media?.type.startsWith("image") ? (
              <img
                src={previewUrl}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="w-full h-full object-cover rounded-lg"
              />
            )
          )}

        </div>


        {/* ================= COLOR PICKER ================= */}
        <div className="flex gap-2 mt-4">
          {bgColors.map((color) => (
            <button
              key={color}
              style={{ backgroundColor: color }}
              onClick={() => setBackground(color)}
              className="w-6 h-6 rounded-full cursor-pointer"
            />
          ))}
        </div>


        {/* ================= MODE SWITCH ================= */}
        <div className="flex gap-2 mt-4">

          {/* Text Mode Button */}
          <button
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded ${
              mode === "text" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <TextIcon size={18} /> Text
          </button>

          {/* Media Upload Button */}
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "media" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <input
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={handleMediaUpload}
            />
            <Upload size={18} /> Photo/Video
          </label>

        </div>


        {/* ================= SUBMIT BUTTON ================= */}
        <button
          onClick={handleSubmit}
          className="w-full mt-4 py-3 rounded bg-gradient-to-r from-indigo-500 to-purple-600 
                     hover:from-indigo-600 hover:to-purple-700 transition"
        >
          <Sparkle size={18} className="inline mr-2" />
          Create Story
        </button>

      </div>

    </div>
  );
};


// ========================== EXPORT ==========================
export default StoryModel;