// ========================== IMPORTS ==========================
import React, { useEffect, useState } from "react";

// Routing
import { useParams, Link } from "react-router-dom";

// Components
import Loading from "../components/Loading";
import UserProfileInfo from "../components/UserProfileInfo";
import PostCard from "../components/PostCard";
import ProfileModal from "../components/ProfileModal";

// Auth
import { useAuth } from "@clerk/clerk-react";

// Redux
import { useSelector } from "react-redux";

// API & Utilities
import api from "../api/axios.js";
import toast from "react-hot-toast";


// ========================== COMPONENT ==========================
const Profile = () => {

  // ========================== AUTH ==========================
  const { getToken } = useAuth();


  // ========================== ROUTING ==========================
  const { profileId } = useParams();


  // ========================== REDUX STATE ==========================
  const currentUser = useSelector((state) => state.user.value);


  // ========================== LOCAL STATE ==========================
  const [user, setUser] = useState(null);         // Profile user data
  const [posts, setPosts] = useState([]);         // User posts
  const [activeTab, setActiveTab] = useState("posts"); // Active tab
  const [showEditProfile, setShowEditProfile] = useState(false); // Modal state


  // ========================== FUNCTIONS ==========================
  /**
   * Fetch user profile and posts
   */
  const fetchUserProfile = async (id) => {
    try {
      const token = await getToken();

      // Validate token
      if (!token) {
        toast.error("Authentication failed");
        return;
      }

      // ================= API REQUEST =================
      const { data } = await api.post(
        `/api/user/profiles`,
        { profileId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Profile API:", data);

      // ================= RESPONSE HANDLING =================
      if (data.success) {
        const profile = data.data?.profile;
        const postsData = data.data?.posts || [];

        setUser(profile);
        setPosts(postsData);

      } else {
        toast.error(data.message);
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user data");
    }
  };


  // ========================== EFFECTS ==========================
  /**
   * Fetch profile data when:
   * - profileId changes
   * - currentUser is available
   */
  useEffect(() => {
    if (!currentUser) return;

    const id = profileId || currentUser._id;
    fetchUserProfile(id);

  }, [profileId, currentUser?._id]);


  // ========================== LOADING ==========================
  if (!user) return <Loading />;


  // ========================== JSX ==========================
  return (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">

      <div className="max-w-3xl mx-auto">

        {/* ========================== PROFILE HEADER ========================== */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">

          {/* -------- COVER IMAGE -------- */}
          <div className="h-40 md:h-56 bg-gradient-to-r 
                          from-indigo-200 via-purple-200 to-pink-200">

            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt=""
                className="w-full h-full object-cover"
              />
            )}

          </div>


          {/* -------- USER INFO -------- */}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEditProfile={setShowEditProfile}
          />

        </div>


        {/* ========================== TABS ========================== */}
        <div className="mt-6">

          <div className="bg-white rounded-xl shadow p-1 
                          flex max-w-md mx-auto">

            {["posts", "media", "likes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-5 py-2 text-sm font-medium rounded-lg ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}

          </div>

        </div>


        {/* ========================== POSTS TAB ========================== */}
        {activeTab === "posts" && (

          <div className="mt-6 flex flex-col items-center gap-6">

            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            ) : (
              <p className="text-gray-500">No posts yet</p>
            )}

          </div>

        )}


        {/* ========================== MEDIA TAB ========================== */}
        {activeTab === "media" && (

          <div className="mt-6 flex flex-wrap max-w-6xl gap-3">

            {posts
              .filter(
                (post) =>
                  (post.image_urls || post.image_url)?.length > 0
              )
              .map((post) => {

                const images =
                  post.image_urls || post.image_url || [];

                return (
                  <div key={post._id}>

                    {images.map((img, index) => (

                      <Link
                        key={index}
                        to={img}
                        target="_blank"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-64 aspect-video 
                                     object-cover rounded"
                        />
                      </Link>

                    ))}

                  </div>
                );
              })}

          </div>

        )}

      </div>


      {/* ========================== EDIT PROFILE MODAL ========================== */}
      {showEditProfile && (
        <ProfileModal
          setShowEditProfile={setShowEditProfile}
        />
      )}

    </div>
  );
};


// ========================== EXPORT ==========================
export default Profile;