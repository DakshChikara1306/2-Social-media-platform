// ========================== IMPORTS ==========================
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";
import { toast } from "react-hot-toast";


// ========================== INITIAL STATE ==========================
const initialState = {
  value: null,    // Stores logged-in user data
  loading: false, // Loading state for API calls
  error: null,    // Error message
};


// ========================== ASYNC THUNKS ==========================
/**
 * Fetch current user data
 */
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (token, { rejectWithValue }) => {
    try {
      // ================= API REQUEST =================
      const { data } = await api.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API response:", data);

      // ================= RESPONSE HANDLING =================
      if (!data.success) {
        return rejectWithValue(data.message);
      }

      return data.data;

    } catch (err) {
      console.error(err);

      // ================= ERROR HANDLING =================
      return rejectWithValue("Something went wrong");
    }
  }
);


/**
 * Update user profile
 */
export const updateUser = createAsyncThunk(
  "user/update",
  async ({ token, userData }, { rejectWithValue }) => {
    try {
      // ================= API REQUEST =================
      const { data } = await api.post(
        "/api/user/update",
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ================= RESPONSE HANDLING =================
      if (data.success) {
        toast.success(data.message);
        return data.user;
      } else {
        toast.error(data.message);
        return rejectWithValue(data.message);
      }

    } catch (err) {
      return rejectWithValue("Update failed");
    }
  }
);


// ========================== SLICE ==========================
const userSlice = createSlice({
  name: "user",
  initialState,

  // ========================== REDUCERS ==========================
  reducers: {
    // No synchronous reducers defined
  },

  // ========================== EXTRA REDUCERS ==========================
  extraReducers: (builder) => {
    builder

      // ===== FETCH USER START =====
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })

      // ===== FETCH USER SUCCESS =====
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.value = action.payload;
        state.loading = false;
      })

      // ===== FETCH USER ERROR =====
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.value = null;
      });

    // ⚠️ NOTE: updateUser is not handled in extraReducers
  },
});


// ========================== EXPORT ==========================
export default userSlice.reducer;