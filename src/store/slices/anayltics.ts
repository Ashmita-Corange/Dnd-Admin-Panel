import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../services/axiosConfig";

interface DashboardData {
  // Define the structure based on your backend response
  [key: string]: any;
}

interface VideoMetrics {
  [key: string]: any;
}

interface UserAnalytics {
  [key: string]: any;
}

interface AnalyticsState {
  dashboard: DashboardData | null;
  videoMetrics: Record<string, VideoMetrics>;
  userAnalytics: Record<string, UserAnalytics>;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboard: null,
  videoMetrics: {},
  userAnalytics: {},
  loading: false,
  error: null,
};

// Async thunks
export const fetchDashboard = createAsyncThunk(
  "analytics/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/analytics/dashboard", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data?.data || {};
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default analyticsSlice.reducer;
