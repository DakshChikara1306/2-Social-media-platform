// ========================== IMPORTS ==========================
import React, { useState } from "react";

// Icons
import { Search } from "lucide-react";

// Components
import Loading from "../components/Loading";
import UserCard from "../components/UserCard";

// API & Auth
import api from "../api/axios";
import { useAuth } from "@clerk/clerk-react";

// Redux
import { useDispatch } from "react-redux";
import { fetchUser } from "../features/user/userSlice";

// Utilities
import { toast } from "react-hot-toast";


// ========================== COMPONENT ==========================
const Discover = () => {

  // ========================== STATE ==========================
  const [input, setInput] = useState("");   // Search input
  const [users, setUsers] = useState([]);   // Search results
  const [loading, setLoading] = useState(false); // Loading state


  // ========================== HOOKS ==========================
  const { getToken } = useAuth();
  const dispatch = useDispatch();


  // ========================== HANDLERS ==========================
  /**
   * Handle search on Enter key
   */
  const handleSearch = async (event) => {

    // Trigger only on Enter key
    if (event.key !== "Enter") return;

    setLoading(true);

    try {
      // Get auth token
      const token = await getToken();

      // API request
      const { data } = await api.post(
        "/api/user/discover",
        { input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle response
      if (data.success) {
        setUsers(data.data || []);
      } else {
        toast.error(data.message);
        setUsers([]);
      }

    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Search failed"
      );
      setUsers([]);
    } finally {
      // Always stop loading
      setLoading(false);
    }
  };


  // ========================== JSX ==========================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      <div className="max-w-6xl mx-auto p-6">

        {/* ========================== HEADER ========================== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Discover People
          </h1>
          <p className="text-slate-600">
            Connect with amazing people and grow your network
          </p>
        </div>


        {/* ========================== SEARCH BOX ========================== */}
        <div className="mb-8 shadow-md rounded-md border bg-white">

          <div className="p-6">

            <div className="relative">

              {/* Search Icon */}
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />

              {/* Input */}
              <input
                type="text"
                placeholder="Search people..."
                className="pl-10 py-2 w-full border rounded-md"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyUp={handleSearch}
              />

            </div>

          </div>

        </div>


        {/* ========================== USERS LIST ========================== */}
        <div className="flex flex-wrap gap-6">

          {/* Empty State */}
          {users.length === 0 && !loading && (
            <p className="text-gray-500">
              No users found
            </p>
          )}

          {/* Users */}
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}

        </div>


        {/* ========================== LOADING ========================== */}
        {loading && <Loading height="60vh" />}

      </div>

    </div>
  );
};


// ========================== EXPORT ==========================
export default Discover;