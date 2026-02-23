// ========================== IMPORTS ==========================
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import toast from "react-hot-toast";


// ========================== INITIAL STATE ==========================
const initialState = {
  messages: [],   // Stores all chat messages
  loading: false, // Loading state for API calls
  error: null,    // Error message if any
};


// ========================== ASYNC THUNKS ==========================
/**
 * Fetch messages for a specific user (chat)
 */
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ token, userId }, { rejectWithValue }) => {
    try {
      // ================= API REQUEST =================
      const res = await api.post(
        "/api/message/get",
        { to_user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ================= RESPONSE HANDLING =================
      if (res.data.success) {
        return res.data.messages || [];
      } else {
        return rejectWithValue(res.data.message);
      }

    } catch (err) {
      // ================= ERROR HANDLING =================
      return rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);


// ========================== SLICE ==========================
const messagesSlice = createSlice({
  name: "messages",
  initialState,

  // ========================== REDUCERS ==========================
  reducers: {

    /**
     * Replace all messages (used on initial load)
     */
    setMessages: (state, action) => {
      state.messages = action.payload || [];
      state.error = null;
    },


    /**
     * Add a new message (used for sending or SSE)
     */
    addMessage: (state, action) => {
      const newMsg = action.payload;

      // Validate message
      if (!newMsg || !newMsg._id) return;

      // Prevent duplicate messages (SSE + API)
      const exists = state.messages.some(
        (msg) => msg._id === newMsg._id
      );

      if (!exists) {
        // Add message
        state.messages.push(newMsg);

        // Keep messages sorted by createdAt
        state.messages.sort(
          (a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );
      }
    },


    /**
     * Reset messages (when switching chats)
     */
    resetMessages: (state) => {
      state.messages = [];
      state.loading = false;
      state.error = null;
    },


    /**
     * Update an existing message (edit / seen status)
     */
    updateMessage: (state, action) => {
      const updated = action.payload;

      // Validate message
      if (!updated || !updated._id) return;

      // Find message index
      const index = state.messages.findIndex(
        (msg) => msg._id === updated._id
      );

      // Update message if found
      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          ...updated,
        };
      }
    },


    /**
     * Delete a message by id
     */
    deleteMessage: (state, action) => {
      const id = action.payload;

      // Validate id
      if (!id) return;

      // Remove message
      state.messages = state.messages.filter(
        (msg) => msg._id !== id
      );
    },
  },


  // ========================== EXTRA REDUCERS ==========================
  extraReducers: (builder) => {
    builder

      // ===== FETCH START =====
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // ===== FETCH SUCCESS =====
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;

        const incoming = action.payload || [];

        // Replace messages with fetched data
        state.messages = incoming;

        // Ensure sorted order
        state.messages.sort(
          (a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );
      })

      // ===== FETCH ERROR =====
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

        // Show error toast
        toast.error(action.payload || "Failed to load messages");
      });
  },
});


// ========================== EXPORT ACTIONS ==========================
export const {
  setMessages,
  addMessage,
  resetMessages,
  updateMessage,
  deleteMessage,
} = messagesSlice.actions;


// ========================== EXPORT REDUCER ==========================
export default messagesSlice.reducer;