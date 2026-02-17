// ================== IMPORTS ==================

import React from 'react';
import { useState } from 'react';

import { ArrowLeft, Sparkle, TextIcon, Upload } from "lucide-react";

import { toast } from 'react-hot-toast';


// ================== COMPONENT ==================

const StoryModel = ({ setShowModel, fetchStories }) => {


  // ================== CONSTANTS ==================

  // Available background colors for text stories
  const bgColors = [
    "#4f46e5",
    "#7c3aed",
    "#db2777",
    "#e11d48",
    "#ea8a04",
    "#bd9488"
  ];


  // ================== STATES ==================

  // Mode: "text" or "media"
  const [mode, setMode] = useState("text");

  // Selected background color
  const [background, setBackground] = useState(bgColors[0]);

  // Text content
  const [text, setText] = useState("");

  // Uploaded media file
  const [media, setMedia] = useState(null);

  // Preview URL for media
  const [previewUrl, setPreviewUrl] = useState(null);



  // ================== MEDIA UPLOAD ==================

  const handleMediaUpload = (e) => {

    const file = e.target.files?.[0];

    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };



  // ================== CREATE STORY ==================

  const handleCreateStory = async () => {

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Refresh stories list
    fetchStories();

    // Close modal
    setShowModel(false);
  };



  // ================== SUBMIT HANDLER ==================

  const handleSubmit = () => {

    toast.promise(handleCreateStory(), {

      loading: "Saving...",

      success: "Story created!",

      error: (e) => e.message || "Failed to create story"

    });
  };



  // ================== UI ==================

  return (

    <div className='fixed inset-0 z-50 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4'>


      <div className="w-full max-w-md">


        {/* ================== HEADER ================== */}

        <div className="text-center mb-4 flex items-center justify-between">


          {/* Back Button */}
          <button
            className="text-white p-2 cursor-pointer"
            onClick={() => setShowModel(false)}
          >
            <ArrowLeft />
          </button>


          {/* Title */}
          <h2 className="text-lg font-semibold">
            Create Story
          </h2>


          {/* Spacer for alignment */}
          <span className='w-10'></span>

        </div>



        {/* ================== PREVIEW BOX ================== */}

        <div
          className="rounded-lg h-96 flex items-center justify-center relative"
          style={{ backgroundColor: background }}
        >


          {/* TEXT MODE */}
          {mode === "text" && (

            <textarea
              className="bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none"
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

          )}


          {/* MEDIA MODE */}
          {mode === "media" && previewUrl && (

            media?.type.startsWith("image") ? (

              // Image Preview
              <img
                className="w-full h-full object-cover rounded-lg"
                src={previewUrl}
                alt="preview"
              />

            ) : (

              // Video Preview
              <video
                className="w-full h-full object-cover rounded-lg"
                src={previewUrl}
                controls
                playsInline
              />

            )
          )}

        </div>



        {/* ================== BACKGROUND COLORS ================== */}

        <div className="flex mt-4 gap-2">

          {bgColors.map((color) => (

            <button
              key={color}
              className="w-6 h-6 rounded-full ring cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setBackground(color)}
            />

          ))}

        </div>



        {/* ================== MODE TOGGLE ================== */}

        <div className="flex mt-4 gap-2">


          {/* TEXT MODE BUTTON */}
          <button
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded ${
              mode === "text"
                ? "bg-white text-black"
                : "bg-zinc-800"
            }`}
          >
            <TextIcon size={18} /> Text
          </button>


          {/* MEDIA MODE BUTTON */}
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "media"
                ? "bg-white text-black"
                : "bg-zinc-800"
            }`}
          >

            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
            />

            <Upload size={18} /> Photo/Video

          </label>

        </div>



        {/* ================== SUBMIT BUTTON ================== */}

        <button
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition"
        >
          <Sparkle size={18} /> Create Story
        </button>


      </div>

    </div>
  );
};

export default StoryModel;
