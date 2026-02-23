// ========================== IMPORTS ==========================
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";


// ========================== INITIAL STATE ==========================
const initialState = {
  connections: [],          // Accepted connections
  pendingConnections: [],   // Pending connection requests
  followers: [],            // Followers list
  following: [],            // Following list
};


// ========================== ASYNC THUNKS ==========================
/**
 * Fetch user connections data from backend
 */
export const fetchConnections = createAsyncThunk(
  "connections/fetchConnections",
  async (token, { rejectWithValue }) => {
    try {
      // ================= API REQUEST =================
      const res = await api.get("/api/user/connections", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ================= RESPONSE HANDLING =================
      if (res.data.success) {
        return res.data.data; // Return actual data
      } else {
        return rejectWithValue(res.data.message);
      }

    } catch (err) {
      // ================= ERROR HANDLING =================
      return rejectWithValue(err.message);
    }
  }
);


// ========================== SLICE ==========================
const connectionsSlice = createSlice({
  name: "connections",
  initialState,

  // ========================== REDUCERS ==========================
  reducers: {
    // No local reducers defined
  },

  // ========================== EXTRA REDUCERS ==========================
  extraReducers: (builder) => {
    builder.addCase(fetchConnections.fulfilled, (state, action) => {

      // Safety check
      if (!action.payload) return;

      // Update state with API data
      state.connections = action.payload.connections || [];
      state.pendingConnections = action.payload.pendingConnections || [];
      state.followers = action.payload.followers || [];
      state.following = action.payload.following || [];

    });
  },
});


// ========================== EXPORT ==========================
export default connectionsSlice.reducer;