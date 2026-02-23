// ========================== IMPORTS ==========================
import React, { useEffect } from "react";

// Icons
import { EyeIcon, MessageSquare } from "lucide-react";

// Routing
import { useNavigate } from "react-router-dom";

// Redux
import { useSelector, useDispatch } from "react-redux";
import { fetchConnections } from "../features/connections/connectionsSlice";

// Auth
import { useAuth } from "@clerk/clerk-react";


// ========================== COMPONENT ==========================
const Messages = () => {

  // ========================== HOOKS ==========================
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();


  // ========================== REDUX STATE ==========================
  const { connections, loading } = useSelector(
    (state) => state.connections
  );


  // ========================== EFFECTS ==========================
  /**
   * Fetch connections (chat users)
   */
  useEffect(() => {

    const loadConnections = async () => {
      try {
        const token = await getToken();

        if (token) {
          dispatch(fetchConnections(token));
        }

      } catch (err) {
        console.error("Connections fetch error:", err);
      }
    };

    // Avoid unnecessary API calls
    if (!connections || connections.length === 0) {
      loadConnections();
    }

  }, [dispatch, getToken, connections?.length]);


  // ========================== JSX ==========================
  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-6xl mx-auto p-6">

        {/* ========================== HEADER ========================== */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Messages
          </h1>

          <p className="text-slate-600">
            Talk to your connections
          </p>

        </div>


        {/* ========================== LOADING ========================== */}
        {loading && (
          <p className="text-center text-gray-500 mt-10">
            Loading...
          </p>
        )}


        {/* ========================== EMPTY STATE ========================== */}
        {!loading && (!connections || connections.length === 0) && (
          <p className="text-center text-gray-500 mt-10">
            No connections found
          </p>
        )}


        {/* ========================== CONNECTION LIST ========================== */}
        <div className="flex flex-col gap-3">

          {connections?.map((user) => (

            <div
              key={user._id}
              className="max-w-xl flex gap-5 p-5 bg-white shadow rounded-md 
                         hover:shadow-md transition"
            >

              {/* -------- PROFILE IMAGE -------- */}
              <img
                src={user.profile_picture || "/default-avatar.png"}
                alt="profile"
                className="rounded-full size-12 object-cover"
              />


              {/* -------- USER INFO -------- */}
              <div className="flex-1">

                <p className="font-medium text-slate-800">
                  {user.full_name}
                </p>

                <p className="text-slate-500">
                  @{user.username}
                </p>

                <p className="text-sm text-gray-600">
                  {user.bio
                    ? user.bio.slice(0, 60)
                    : "No bio available"}
                </p>

              </div>


              {/* -------- ACTION BUTTONS -------- */}
              <div className="flex flex-col gap-2">

                {/* Open Chat */}
                <button
                  onClick={() =>
                    navigate(`/messages/${user._id}`)
                  }
                  className="size-10 flex items-center justify-center rounded 
                             bg-slate-100 hover:bg-slate-200 
                             active:scale-95 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>


                {/* View Profile */}
                <button
                  onClick={() =>
                    navigate(`/profile/${user._id}`)
                  }
                  className="size-10 flex items-center justify-center rounded 
                             bg-slate-100 hover:bg-slate-200 
                             active:scale-95 transition"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};


// ========================== EXPORT ==========================
export default Messages;