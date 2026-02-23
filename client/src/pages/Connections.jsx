// ========================== IMPORTS ==========================
import React, { useState, useEffect } from "react";

// Icons
import {
  Users,
  UserPlus,
  UserCheck,
  UserRoundPen,
  MessageSquare,
} from "lucide-react";

// Routing
import { useNavigate } from "react-router-dom";

// Redux
import { useSelector, useDispatch } from "react-redux";
import { fetchConnections } from "../features/connections/connectionsSlice";

// Auth & API
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";

// Utilities
import { toast } from "react-hot-toast";


// ========================== COMPONENT ==========================
const Connections = () => {

  // ========================== HOOKS ==========================
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();


  // ========================== STATE ==========================
  const [currentTab, setCurrentTab] = useState("Followers");


  // ========================== REDUX STATE ==========================
  const {
    connections,
    followers,
    following,
    pendingConnections,
  } = useSelector((state) => state.connections);


  // ========================== DATA CONFIG ==========================
  // Used for tabs and counts
  const dataArray = [
    { label: "Followers", icon: Users, value: followers },
    { label: "Following", icon: UserCheck, value: following },
    { label: "Connections", icon: UserPlus, value: connections },
    {
      label: "Pending Connections",
      icon: UserRoundPen,
      value: pendingConnections,
    },
  ];


  // ========================== API HANDLERS ==========================
  /**
   * Unfollow user
   */
  const handleUnfollow = async (userId) => {
    try {
      const { data } = await api.post(
        "/api/user/unfollow",
        { id: userId },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);

        // Refresh connections
        dispatch(fetchConnections(await getToken()));
      } else {
        toast.error(data.message);
      }

    } catch (err) {
      toast.error("Failed to unfollow user");
    }
  };


  /**
   * Accept connection request
   */
  const acceptConnection = async (userId) => {
    try {
      const { data } = await api.post(
        "/api/user/accept",
        { id: userId },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);

        // Refresh connections
        dispatch(fetchConnections(await getToken()));
      } else {
        toast.error(data.message);
      }

    } catch (err) {
      toast.error("Failed to accept connection");
    }
  };


  // ========================== EFFECTS ==========================
  /**
   * Fetch connections on mount
   */
  useEffect(() => {
    const loadConnections = async () => {
      const token = await getToken();
      dispatch(fetchConnections(token));
    };

    loadConnections();

  }, [dispatch, getToken]);


  // ========================== DERIVED DATA ==========================
  const currentList =
    dataArray.find((item) => item.label === currentTab)?.value || [];


  // ========================== JSX ==========================
  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-6xl mx-auto p-6">

        {/* ========================== HEADER ========================== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Connections
          </h1>
          <p className="text-slate-600">
            Manage your network and discover new people
          </p>
        </div>


        {/* ========================== COUNTS ========================== */}
        <div className="mb-8 flex flex-wrap gap-6">

          {dataArray.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-1 border h-20 w-40 
                         border-gray-200 bg-white shadow rounded-md"
            >
              <b>{item.value?.length || 0}</b>
              <p className="text-slate-600">{item.label}</p>
            </div>
          ))}

        </div>


        {/* ========================== TABS ========================== */}
        <div className="inline-flex flex-wrap items-center border border-gray-200 
                        rounded-md p-1 bg-white shadow-sm">

          {dataArray.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setCurrentTab(tab.label)}
              className={`flex items-center px-3 py-1 cursor-pointer text-sm rounded-md transition-colors ${
                currentTab === tab.label
                  ? "bg-white font-medium text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >

              <tab.icon className="w-4 h-4" />

              <span className="ml-1">{tab.label}</span>

              {/* NOTE: tab.count not defined in original code */}
              {tab.count !== undefined && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}

            </button>
          ))}

        </div>


        {/* ========================== LIST ========================== */}
        <div className="flex flex-wrap gap-6 mt-6">

          {currentList.map((user) => (

            <div
              key={user._id}
              className="w-full max-w-88 flex gap-5 p-6 bg-white shadow rounded-md"
            >

              {/* PROFILE IMAGE */}
              <img
                src={user.profile_picture}
                alt=""
                className="rounded-full w-12 h-12 shadow-md mx-auto"
              />


              {/* USER INFO */}
              <div className="flex-1">

                <p className="font-medium text-slate-700">
                  {user.full_name}
                </p>

                <p className="text-slate-500">
                  @{user.username}
                </p>

                <p className="text-sm text-gray-600">
                  {user.bio.slice(0, 30)}...
                </p>


                {/* ACTION BUTTONS */}
                <div className="flex max-sm:flex-col gap-2 mt-4">

                  {/* View Profile */}
                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="w-full p-2 text-sm rounded bg-gradient-to-r 
                               from-indigo-500 to-purple-600 
                               hover:from-indigo-600 hover:to-purple-700 
                               active:scale-95 transition text-white cursor-pointer"
                  >
                    View Profile
                  </button>


                  {/* Unfollow */}
                  {currentTab === "Following" && (
                    <button
                      onClick={() => handleUnfollow(user._id)}
                      className="w-full p-2 text-sm rounded bg-slate-100 
                                 hover:bg-slate-200 text-black 
                                 active:scale-95 transition cursor-pointer"
                    >
                      Unfollow
                    </button>
                  )}


                  {/* Accept Connection */}
                  {currentTab === "Pending Connections" && (
                    <button
                      onClick={() => acceptConnection(user._id)}
                      className="w-full p-2 text-sm rounded bg-slate-100 
                                 hover:bg-slate-200 text-black 
                                 active:scale-95 transition cursor-pointer"
                    >
                      Accept
                    </button>
                  )}


                  {/* Message */}
                  {currentTab === "Connections" && (
                    <button
                      onClick={() => navigate(`/messages/${user._id}`)}
                      className="w-full p-2 text-sm rounded bg-slate-100 
                                 hover:bg-slate-200 text-slate-800 
                                 active:scale-95 transition cursor-pointer 
                                 flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};


// ========================== EXPORT ==========================
export default Connections;