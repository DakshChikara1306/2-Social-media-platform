// ========================== IMPORTS ==========================
import React, { useState } from 'react';

// Icons
import { MapPin, UserPlus, MessageCircle, Plus } from 'lucide-react';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser } from '../features/user/userSlice';
import { fetchConnections } from '../features/connections/connectionsSlice';

// API & Auth
import api from '../api/axios';
import { useAuth } from '@clerk/clerk-react';

// Utilities
import toast from 'react-hot-toast';

// Routing
import { useNavigate } from 'react-router-dom';


// ========================== COMPONENT ==========================
const UserCard = ({ user }) => {

  // ========================== HOOKS ==========================
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get current logged-in user from Redux
  const currentUser = useSelector((state) => state.user.value);


  // ========================== STATE ==========================
  // Loading states for actions
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingConnect, setLoadingConnect] = useState(false);


  // ========================== DERIVED DATA ==========================
  // Safe arrays (avoid undefined errors)
  const following = currentUser?.following || [];
  const connections = currentUser?.connections || [];


  // ========================== HANDLERS ==========================
  /**
   * Handle follow/unfollow action
   */
  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setLoadingFollow(true);

      // Get auth token
      const token = await getToken();

      // API request
      const { data } = await api.post(
        "/api/user/follow",
        { id: user._id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Handle response
      if (data.success) {
        toast.success(data.message);

        // Refresh user & connections
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token));
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingFollow(false);
    }
  };


  /**
   * Handle connection request / message navigation
   */
  const handleConnectionRequest = async () => {
    if (!currentUser) return;

    // If already connected → go to chat
    if (connections.includes(user._id)) {
      return navigate(`/messages/${user._id}`);
    }

    try {
      setLoadingConnect(true);

      // Get auth token
      const token = await getToken();

      // API request
      const { data } = await api.post(
        "/api/user/connect",
        { id: user._id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Handle response
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingConnect(false);
    }
  };


  // ========================== JSX ==========================
  return (
    <div className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md">

      {/* ========================== USER INFO ========================== */}
      <div className="text-center">

        {/* Profile Image */}
        <img
          src={user.profile_picture || "/default-avatar.png"}
          alt="profile"
          className="rounded-full w-16 h-16 object-cover shadow-md mx-auto"
        />

        {/* Name */}
        <p className="mt-4 font-semibold">
          {user.full_name}
        </p>

        {/* Username */}
        {user.username && (
          <p className="text-gray-500 font-light">
            @{user.username}
          </p>
        )}

        {/* Bio */}
        {user.bio && (
          <p className="text-gray-600 mt-2 text-sm px-4">
            {user.bio}
          </p>
        )}

      </div>


      {/* ========================== USER META INFO ========================== */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">

        {/* Location */}
        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
          <MapPin className="h-4 w-4" />
          {user.location || "Unknown"}
        </div>

        {/* Followers Count */}
        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
          <span>{user.followers?.length || 0}</span> Followers
        </div>

      </div>


      {/* ========================== ACTION BUTTONS ========================== */}
      <div className="flex mt-2 gap-2">

        {/* -------- FOLLOW BUTTON -------- */}
        <button
          onClick={handleFollow}
          disabled={following.includes(user._id) || loadingFollow}
          className="
            w-full py-2 rounded-md flex justify-center items-center gap-2 
            bg-gradient-to-r from-indigo-500 to-purple-600 
            hover:from-indigo-600 hover:to-purple-700 
            active:scale-95 transition text-white disabled:opacity-50
          "
        >
          <UserPlus className="w-4 h-4" />
          {following.includes(user._id) ? "Following" : "Follow"}
        </button>


        {/* -------- CONNECT / MESSAGE BUTTON -------- */}
        <button
          onClick={handleConnectionRequest}
          disabled={loadingConnect}
          className="flex items-center justify-center w-16 border text-slate-500 
                     group rounded-md active:scale-95 transition disabled:opacity-50"
        >

          {connections.includes(user._id) ? (
            <MessageCircle className="w-5 h-5 group-hover:scale-105 transition" />
          ) : (
            <Plus className="w-5 h-5 group-hover:scale-95 transition" />
          )}

        </button>

      </div>

    </div>
  );
};


// ========================== EXPORT ==========================
export default UserCard;