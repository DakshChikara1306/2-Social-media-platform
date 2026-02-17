// ================== IMPORTS ==================

import React, { use } from 'react';

import { useState, useEffect } from 'react';

import { dummyPostsData, assets } from '../assets/assets';

import Loading from '../components/Loading';

import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RecentMessages from '../components/RecentMessages';


// ================== COMPONENT ==================

const Feed = () => {


  // ================== STATES ==================

  // Stores all feed posts
  const [feeds, setFeeds] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);



  // ================== FETCH FEEDS ==================

  const fetchFeeds = async () => {

    // Using dummy data for now
    setFeeds(dummyPostsData);

    // Stop loading
    setLoading(false);
  };



  // ================== EFFECT ==================

  // Fetch feeds on mount
  useEffect(() => {
    fetchFeeds();
  }, []);



  // ================== UI ==================

  return !loading ? (


    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">


      {/* ================== LEFT SECTION (STORIES + POSTS) ================== */}

      <div>


        {/* Stories */}
        <StoriesBar />


        {/* Posts List */}
        <div className="p-4 space-y-6">

          {/* Posts will be rendered here */}
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

      </div>



      {/* ================== RIGHT SIDEBAR ================== */}

      <div className="max-xl:hidden sticky top-0">


        {/* Sponsored Card */}
        <div className="max-w-xs bg-white text-xs p-4 rounded-md flex flex-col gap-2 shadow">


          <h3 className="text-slate-800 font-semibold">
            Sponsored
          </h3>


          <img
            src={assets.sponsored_img}
            alt="Sponsored"
            className="w-full h-auto rounded-md object-cover"
          />


          <p className="text-slate-600 font-medium">
            Email Marketing
          </p>


          <p className="text-slate-400 text-sm">
            Supercharge your marketing with a powerful, easy-to-use platform built for results.
          </p>


        </div>
        <RecentMessages />

      </div>


    </div>

  ) : (


    // ================== LOADING STATE ==================

    <Loading />

  );
};

export default Feed;
