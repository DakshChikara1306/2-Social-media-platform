// ================== IMPORTS ==================

import React, { use } from 'react';

import { useState, useEffect } from 'react';

import { dummyStoriesData } from '../assets/assets';

import { Plus } from "lucide-react";

import moment from 'moment';

import StoryModel from './StoryModel';
import StoryViewer from './StoryViewer';


// ================== COMPONENT ==================

const StoriesBar = () => {


  // ================== STATES ==================

  // Controls Add Story modal visibility
  const [showModel, setShowModel] = useState(false);

  // Stores all stories
  const [stories, setStories] = useState([]);

  // Selected story to view (currently unused here)
  const [viewStory, setViewStory] = useState(null);



  // ================== FETCH STORIES ==================

  const fetchStories = async () => {

    // Dummy data used for now
    setStories(dummyStoriesData);
  };



  // ================== EFFECT ==================

  // Fetch stories on component mount
  useEffect(() => {
    fetchStories();
  }, []);



  // ================== UI ==================

  return (

    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">


      {/* ================== STORIES CONTAINER ================== */}

      <div className="flex gap-4 pb-5">


        {/* ================== ADD STORY CARD ================== */}

        <div
          onClick={() => setShowModel(true)}
          className="rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white"
        >

          <div className="h-full flex flex-col items-center justify-center p-4">

            <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3">

              <Plus className="h-5 w-5 text-white" />

            </div>

            <p className="text-sm font-medium text-slate-700">
              Create Story
            </p>

          </div>

        </div>



        {/* ================== STORY ITEMS ================== */}

        {stories.map((story, index) => (

          <div
          onClick={()=> setViewStory(story)}
            key={index}
            className="relative rounded-lg shadow min-w-30 max-w-30 max-h-40 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95"
          >


            {/* User Profile Image */}
            <img
              src={story.user.profile_picture}
              alt=""
              className="absolute size-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow"
            />


            {/* Story Content Text */}
            <p className="absolute top-18 left-3 text-white/60 text-sm truncate max-w-24">
              {story.content}
            </p>


            {/* Time (e.g., 2 hours ago) */}
            <p className="text-white absolute bottom-1 right-2 z-10 text-xs">
              {moment(story.createdAt).fromNow()}
            </p>



            {/* ================== MEDIA (IMAGE / VIDEO) ================== */}

            {story.media_type !== "text" && story.media_url && (

              <div className="absolute inset-0 z-0 rounded-lg overflow-hidden">

                {/* Image */}
                {story.media_type === "image" ? (

                  <img
                    src={story.media_url}
                    alt=""
                    className="h-full w-full object-cover hover:scale-110 transition-transform duration-500 opacity-70 hover:opacity-80"
                  />

                ) : (

                  /* Video */
                  <video
                    src={story.media_url}
                    className="h-full w-full object-cover hover:scale-110 transition-transform duration-500 opacity-70 hover:opacity-80"
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



      {/* ================== ADD STORY MODAL ================== */}

      {showModel && (
        <StoryModel
          setShowModel={setShowModel}
          fetchStories={fetchStories}
        />
      )}
      {/* ================== STORY VIEWER MODAL (currently unused) ================== */}
      
      {viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />}

    </div>
  );
};

export default StoriesBar;
