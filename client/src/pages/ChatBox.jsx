// ========================== IMPORTS ==========================
import React, { useEffect, useRef, useState } from "react";

// Icons
import { ImageIcon, SendHorizonal } from "lucide-react";

// Routing
import { useParams } from "react-router-dom";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  addMessage,
  resetMessages,
} from "../features/messages/messagesSlice";

// Auth
import { useAuth, useUser } from "@clerk/clerk-react";

// API & Utilities
import api from "../api/axios";
import toast from "react-hot-toast";


// ========================== COMPONENT ==========================
const ChatBox = () => {

  // ========================== ROUTING ==========================
  const { userId } = useParams(); // Receiver user ID


  // ========================== AUTH ==========================
  const { getToken } = useAuth();
  const { user } = useUser();


  // ========================== REDUX ==========================
  const dispatch = useDispatch();

  // Messages state
  const { messages, loading } = useSelector((state) => state.messages);

  // Connections (for chat user info)
  const { connections } = useSelector((state) => state.connections);


  // ========================== LOCAL STATE ==========================
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);


  // ========================== REFS ==========================
  const containerRef = useRef(null);


  // ========================== DERIVED DATA ==========================
  // Current chat user (receiver)
  const chatUser = connections.find((u) => u._id === userId);


  // ========================== EFFECTS ==========================
  /**
   * Fetch messages when userId changes
   */
  useEffect(() => {
    if (!userId) return;

    const loadMessages = async () => {
      try {
        const token = await getToken();
        dispatch(fetchMessages({ token, userId }));
      } catch (err) {
        toast.error("Failed to load messages");
      }
    };

    // Clear previous chat messages
    dispatch(resetMessages());

    // Fetch new chat messages
    loadMessages();

  }, [userId, dispatch, getToken]);


  /**
   * Auto scroll to bottom when messages change
   */
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);


  // ========================== HANDLERS ==========================
  /**
   * Send message (text or image)
   */
  const sendMessage = async () => {

    // Validation
    if (!text.trim() && !file) {
      return toast.error("Please enter a message");
    }

    try {
      const token = await getToken();

      // Prepare form data
      const formData = new FormData();
      formData.append("to_user_id", userId);

      if (text.trim()) formData.append("text", text.trim());
      if (file) formData.append("file", file);

      // API request
      const res = await api.post("/api/message/send", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle response
      if (res.data.success) {
        dispatch(addMessage(res.data.message)); // instant UI update
        setText("");
        setFile(null);
      } else {
        toast.error(res.data.message);
      }

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Send failed");
    }
  };


  /**
   * Handle image file selection
   */
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate file type
    if (!selected.type.startsWith("image")) {
      toast.error("Only images allowed");
      return;
    }

    setFile(selected);
  };


  // ========================== CONDITIONAL UI ==========================
  // If chat user not found
  if (!chatUser) {
    return <div className="p-5">User not found</div>;
  }


  // ========================== JSX ==========================
  return (
    <div className="flex flex-col h-screen">

      {/* ========================== HEADER ========================== */}
      <div className="flex items-center gap-3 p-3 border-b bg-indigo-50">

        <img
          src={chatUser.profile_picture}
          alt=""
          className="size-9 rounded-full"
        />

        <div>
          <p className="font-medium">{chatUser.full_name}</p>
          <p className="text-sm text-gray-500">
            @{chatUser.username}
          </p>
        </div>

      </div>


      {/* ========================== MESSAGES ========================== */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-5"
      >

        <div className="max-w-3xl mx-auto space-y-3">

          {/* Loading State */}
          {loading && (
            <p className="text-center text-gray-400">
              Loading...
            </p>
          )}

          {/* Empty State */}
          {!loading && messages.length === 0 && (
            <p className="text-center text-gray-400">
              No messages yet
            </p>
          )}

          {/* Messages List */}
          {messages
            .slice()
            .sort(
              (a, b) =>
                new Date(a.createdAt) - new Date(b.createdAt)
            )
            .map((msg) => {

              // Check if message is sent by current user
              const isMe = msg.from_user_id === user?.id;

              return (
                <div
                  key={msg._id}
                  className={`flex ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >

                  <div
                    className={`p-2 rounded shadow max-w-xs ${
                      isMe
                        ? "bg-indigo-600 text-white"
                        : "bg-white"
                    }`}
                  >

                    {/* -------- IMAGE -------- */}
                    {msg.media_url && (
                      <img
                        src={msg.media_url}
                        alt=""
                        className="mb-1 rounded"
                      />
                    )}

                    {/* -------- TEXT -------- */}
                    {msg.text && <p>{msg.text}</p>}

                  </div>

                </div>
              );
            })}

        </div>
      </div>


      {/* ========================== INPUT AREA ========================== */}
      <div className="p-3 border-t bg-white">

        <div className="flex items-center gap-2 max-w-3xl mx-auto">

          {/* -------- TEXT INPUT -------- */}
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border px-3 py-2 rounded outline-none"
            value={text}
            onChange={(e) => setText(e.target.value)}

            // Send message on Enter key
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
          />


          {/* -------- IMAGE INPUT -------- */}
          <label htmlFor="file">
            {file ? (
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-8 rounded cursor-pointer"
              />
            ) : (
              <ImageIcon className="cursor-pointer text-gray-500" />
            )}
          </label>

          <input
            type="file"
            id="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />


          {/* -------- SEND BUTTON -------- */}
          <button
            onClick={sendMessage}
            disabled={!text.trim() && !file}
            className={`p-2 rounded-full transition ${
              !text.trim() && !file
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-indigo-600 text-white"
            }`}
          >
            <SendHorizonal size={18} />
          </button>

        </div>

      </div>

    </div>
  );
};


// ========================== EXPORT ==========================
export default ChatBox;