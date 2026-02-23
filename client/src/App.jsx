// ========================== IMPORTS ==========================
import React, { useEffect, useRef } from "react";

// Routing
import { Routes, Route, useLocation } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Layout from "./pages/Layout";

// Libraries
import { Toaster } from "react-hot-toast";
import { useUser, useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Notifications from "./components/Notification";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "./features/user/userSlice";
import { fetchConnections } from "./features/connections/connectionsSlice";
import { addMessage } from "./features/messages/messagesSlice";


// ========================== COMPONENT ==========================
const App = () => {

  // ========================== AUTH ==========================
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();


  // ========================== REDUX ==========================
  const dispatch = useDispatch();

  // Global state
  const userData = useSelector((state) => state.user.value);
  const connections = useSelector(
    (state) => state.connections.connections
  );


  // ========================== ROUTE TRACKING ==========================
  const location = useLocation();
  const pathnameRef = useRef(location.pathname);


  // ========================== SSE REF ==========================
  const eventSourceRef = useRef(null);


  // ========================== EFFECTS ==========================

  /**
   * Track current route (useful for future logic)
   */
  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);


  /**
   * Load global data (user + connections)
   */
  useEffect(() => {

    // Wait for Clerk to load
    if (!isLoaded || !user) return;

    const loadData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Fetch user if not already present
        if (!userData) {
          dispatch(fetchUser(token));
        }

        // Fetch connections only once
        if (!connections || connections.length === 0) {
          dispatch(fetchConnections(token));
        }

      } catch (err) {
        console.error("App Load Error:", err);
      }
    };

    loadData();

  }, [
    user,
    isLoaded,
    dispatch,
    getToken,
    userData,
    connections?.length,
  ]);


  /**
   * SSE (Server-Sent Events) for real-time messaging
   */
  useEffect(() => {

    // If no user → don't connect
    if (!user) return;

    // Prevent multiple SSE connections
    if (eventSourceRef.current) return;

    // ================= CREATE SSE CONNECTION =================
    const eventSource = new EventSource(
      `${import.meta.env.VITE_BASEURL}/api/message/sse/${user.id}`
    );

    eventSourceRef.current = eventSource;


    // ================= SSE EVENTS =================
    eventSource.onopen = () => {
      console.log("✅ SSE Connected");
    };

   eventSource.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);

    if (!data || !data.type) return;

    if (data.type === "NEW_MESSAGE") {
      const message = data.message;

      const currentPath = pathnameRef.current;

      const isChatOpen = currentPath.includes(
        `/messages/${message.from_user_id}`
      );

      // Always update store
      dispatch(addMessage(message));

      // Show notification ONLY if:
      // 1. You are receiver
      // 2. Chat is not open
      if (
        message.to_user_id === user.id &&
        !isChatOpen
      ) {
        toast.custom(
          (t) => <Notifications t={t} message={message} />,
          { position: "bottom-right" }
        );
      }
    }
  } catch (err) {
    console.error("SSE parse error:", err);
  }
};

    eventSource.onerror = (err) => {
      console.error("❌ SSE Error:", err);

      // Close connection on error
      eventSource.close();
      eventSourceRef.current = null;
    };


    // ================= CLEANUP =================
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };

  }, [user, dispatch]);


  // ========================== JSX ==========================
  return (
    <>
      {/* Toast notifications */}
      <Toaster position="top-right" />

      {/* Routes */}
      <Routes>

        {/* Protected Layout */}
        <Route
          path="/"
          element={!user ? <Login /> : <Layout />}
        >

          {/* Home */}
          <Route index element={<Feed />} />

          {/* Messages */}
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />

          {/* Connections */}
          <Route path="connections" element={<Connections />} />

          {/* Discover */}
          <Route path="discover" element={<Discover />} />

          {/* Profile */}
          <Route path="profile" element={<Profile />} />
          <Route
            path="profile/:profileId"
            element={<Profile />}
          />

          {/* Create Post */}
          <Route path="create-post" element={<CreatePost />} />

        </Route>

      </Routes>
    </>
  );
};


// ========================== EXPORT ==========================
export default App;