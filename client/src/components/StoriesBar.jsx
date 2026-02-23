// ========================== IMPORTS ==========================
import React, { useState, useEffect } from 'react';

// Assets (dummy data - currently unused)
import { dummyStoriesData } from '../assets/assets';

// Icons
import { Plus } from "lucide-react";

// Utilities
import moment from 'moment';
import toast from "react-hot-toast";

// Components
import StoryModel from './StoryModel';
import StoryViewer from './StoryViewer';

// Auth & API
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";


// ========================== COMPONENT ==========================
const StoriesBar = () => {

  // ========================== AUTH ==========================
  const { getToken, userId } = useAuth();


  // ========================== STATE ==========================
  // Controls Add Story modal visibility
  const [showModel, setShowModel] = useState(false);

  // Stores all stories
  const [stories, setStories] = useState([]);

  // Stores selected story for viewing
  const [viewStory, setViewStory] = useState(null);


  // ========================== FUNCTIONS ==========================
  /**
   * Fetch all stories from backend API
   */
  const fetchStories = async () => {
    try {
      // Get auth token
      const token = await getToken();

      // API request
      const { data } = await api.get('/api/story/get', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("API RESPONSE:", data);

      // Handle response
      if (data.success) {
        setStories(data.data || []);
      } else {
        setStories([]);
        toast.error(data.message || "Failed to fetch stories");
      }

    } catch (error) {
      setStories([]);
      toast.error(error.message || "Failed to fetch stories");
    }
  };


  // ========================== EFFECTS ==========================
  // Fetch stories on component mount
  useEffect(() => {
    fetchStories();
  }, []);


  // ========================== JSX ==========================
  return (

    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">

      {/* ========================== STORIES CONTAINER ========================== */}
      <div className="flex gap-4 pb-5">


        {/* ========================== ADD STORY CARD ========================== */}
        <div
          onClick={() => setShowModel(true)}
          className="rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer 
                     hover:shadow-lg transition-all duration-200 border-2 border-dashed 
                     border-indigo-300 bg-gradient-to-b from-indigo-50 to-white"
        >

          <div className="h-full flex flex-col items-center justify-center p-4">

            {/* Add Icon */}
            <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
              <Plus className="h-5 w-5 text-white" />
            </div>

            {/* Text */}
            <p className="text-sm font-medium text-slate-700">
              Create Story
            </p>

          </div>

        </div>


        {/* ========================== STORY ITEMS ========================== */}
        {Array.isArray(stories) && stories.map((story, index) => (

          <div
            key={index}
            onClick={() => setViewStory(story)}
            className="relative rounded-lg shadow min-w-30 max-w-30 max-h-40 cursor-pointer 
                       hover:shadow-lg transition-all duration-200 
                       bg-gradient-to-b from-indigo-500 to-purple-600 
                       hover:from-indigo-700 hover:to-purple-800 active:scale-95"
          >

            {/* -------- USER PROFILE IMAGE -------- */}
            <img
              src={story.user?.profile_picture || "/default-profile.png"}
              alt=""
              className="absolute size-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow"
            />


            {/* -------- STORY TEXT -------- */}
            <p className="absolute top-18 left-3 text-white/60 text-sm truncate max-w-24">
              {story.content}
            </p>


            {/* -------- TIME -------- */}
            <p className="text-white absolute bottom-1 right-2 z-10 text-xs">
              {moment(story.createdAt).fromNow()}
            </p>


            {/* ========================== MEDIA (IMAGE / VIDEO) ========================== */}
            {story.media_type !== "text" && story.media_url && (

              <div className="absolute inset-0 z-0 rounded-lg overflow-hidden">

                {/* -------- IMAGE -------- */}
                {story.media_type === "image" ? (

                  <img
                    src={story.media_url}
                    alt=""
                    className="h-full w-full object-cover hover:scale-110 
                               transition-transform duration-500 opacity-70 hover:opacity-80"
                  />

                ) : (

                  /* -------- VIDEO -------- */
                  <video
                    src={story.media_url}
                    className="h-full w-full object-cover hover:scale-110 
                               transition-transform duration-500 opacity-70 hover:opacity-80"
                    autoPlay
                    muted
                    loop
                  />

                )}

              </div>

            )}

          </div>

        ))}

      </div>


      {/* ========================== ADD STORY MODAL ========================== */}
      {showModel && (
        <StoryModel
          setShowModel={setShowModel}
          fetchStories={fetchStories}
        />
      )}


      {/* ========================== STORY VIEWER MODAL ========================== */}
      {viewStory && (
        <StoryViewer
          viewStory={viewStory}
          setViewStory={setViewStory}
        />
      )}

    </div>
  );
};


// ========================== EXPORT ==========================
export default StoriesBar;