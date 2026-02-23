// ========================== IMPORTS ==========================
import React, { useState, useEffect } from "react";

// Components
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";

// Auth & API
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";

// Utilities
import toast from "react-hot-toast";

// Assets
import { assets } from "../assets/assets";


// ========================== COMPONENT ==========================
const Feed = () => {

  // ========================== AUTH ==========================
  const { getToken } = useAuth();


  // ========================== STATE ==========================
  const [feeds, setFeeds] = useState([]);     // Feed posts
  const [loading, setLoading] = useState(true); // Loading state


  // ========================== FUNCTIONS ==========================
  /**
   * Fetch feed posts from backend
   */
  const fetchFeeds = async () => {
    try {
      setLoading(true);

      // Get auth token
      const token = await getToken();

      // API request
      const { data } = await api.get("/api/post/feed", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle response
      if (data.success) {
        setFeeds(data.posts || []);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    } finally {
      // Always stop loading
      setLoading(false);
    }
  };


  // ========================== EFFECTS ==========================
  /**
   * Fetch feed on component mount
   */
  useEffect(() => {
    fetchFeeds();
  }, []);


  // ========================== LOADING ==========================
  if (loading) return <Loading />;


  // ========================== JSX ==========================
  return (
    <div className="h-full overflow-y-scroll py-10 flex justify-center gap-8">

      {/* ========================== LEFT SECTION ========================== */}
      <div>

        {/* Stories */}
        <StoriesBar />

        {/* Posts */}
        <div className="p-4 space-y-6">

          {feeds.length === 0 ? (
            <p className="text-center text-gray-500">
              No posts yet
            </p>
          ) : (
            feeds.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          )}

        </div>

      </div>


      {/* ========================== RIGHT SECTION ========================== */}
      <div className="hidden xl:block sticky top-0">

        {/* -------- Sponsored -------- */}
        <div className="max-w-xs bg-white p-4 rounded shadow">

          <h3 className="font-semibold">
            Sponsored
          </h3>

          <img
            src={assets.sponsored_img}
            className="w-full rounded mt-2"
            alt=""
          />

          <p className="text-sm text-gray-500 mt-2">
            Boost your marketing
          </p>

        </div>


        {/* -------- Recent Messages -------- */}
        <RecentMessages />

      </div>

    </div>
  );
};


// ========================== EXPORT ==========================
export default Feed;