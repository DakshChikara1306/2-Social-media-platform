// ========================== IMPORTS ==========================
import React, { use } from 'react'; // ⚠️ 'use' is unused (kept as-is)
import { useState, useEffect } from 'react';

// Icons
import { BadgeCheck, X } from 'lucide-react';


// ========================== COMPONENT ==========================
const StoryViewer = ({ viewStory, setViewStory }) => {

  // ========================== STATE ==========================
  // Progress for story timer (used for non-video stories)
  const [progress, setProgress] = useState(0);


  // ========================== EFFECTS ==========================
  /**
   * Handles auto-close and progress animation for stories
   */
  useEffect(() => {
    let timer, progressInterval;

    // Only run for non-video stories
    if (viewStory && viewStory.media_type !== 'video') {

      // Reset progress
      setProgress(0);

      const duration = 10000; // 10 seconds
      const setTime = 100;    // update every 100ms
      let elapsed = 0;

      // Progress animation
      progressInterval = setInterval(() => {
        elapsed += setTime;
        setProgress((elapsed / duration) * 100);
      }, setTime);

      // Auto close story after duration
      timer = setTimeout(() => {
        setViewStory(null);
      }, duration);
    }

    // Cleanup on unmount or story change
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };

  }, [viewStory, setViewStory]);


  // ========================== HANDLERS ==========================
  /**
   * Close story viewer
   */
  const handleClose = () => {
    setViewStory(null);
  };


  /**
   * Render story content based on media type
   */
  const renderContent = () => {
    switch (viewStory.media_type) {

      // -------- IMAGE --------
      case 'image':
        return (
          <img
            src={viewStory.media_url}
            alt="story media"
            className="max-w-full max-h-full object-contain"
          />
        );

      // -------- VIDEO --------
      case 'video':
        return (
          <video
            src={viewStory.media_url}
            onEnded={() => setViewStory(null)}
            controls
            autoPlay
            className="max-h-screen"
          />
        );

      // -------- TEXT --------
      case 'text':
        return (
          <div className="text-white text-2xl sm:text-4xl font-medium p-6 rounded-lg">
            {viewStory.content}
          </div>
        );

      // -------- DEFAULT --------
      default:
        return null;
    }
  };


  // ========================== JSX ==========================
  return (
    <div
      className="fixed inset-0 h-screen bg-black bg-opacity-90 z-110 flex items-center justify-center"
      style={{
        backgroundColor:
          viewStory.media_type === 'text'
            ? viewStory.background_color
            : '#000000'
      }}
    >

      {/* ========================== PROGRESS BAR ========================== */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">

        <div
          className="h-full bg-white transition-all duration-100 linear"
          style={{ width: `${progress}%` }}
        />

      </div>


      {/* ========================== USER INFO ========================== */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50">

        {/* Profile Image */}
        <img
          src={viewStory.user?.profile_picture}
          alt=""
          className="size-7 sm:size-8 rounded-full object-cover border border-white"
        />

        {/* Name & Badge */}
        <div className="text-white font-medium flex items-center gap-1.5">

          <span>
            {viewStory.user?.full_name}
          </span>

          <BadgeCheck size={18} />

        </div>

      </div>


      {/* ========================== CLOSE BUTTON ========================== */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none"
      >
        <X className="w-8 h-8 hover:scale-110 transition cursor-pointer" />
      </button>


      {/* ========================== CONTENT WRAPPER ========================== */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {renderContent()}
      </div>

    </div>
  );
};


// ========================== EXPORT ==========================
export default StoryViewer;