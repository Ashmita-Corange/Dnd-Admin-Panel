import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../services/axiosConfig";

interface VideoState {
  loading: boolean;
  error: string | null;
  data: any;
}

const initialState: VideoState = {
  loading: false,
  error: null,
  data: null,
};

export const uploadVideo = createAsyncThunk(
  "video/uploadVideo",
  async (
    {
      file,
      lessonId,
      sourcePlatform,
      title,
      description,
      youtubeUrl = "",
      accessToken,
      refreshToken,
    }: {
      file: File;
      lessonId: string;
      sourcePlatform: string;
      title: string;
      description: string;
      youtubeUrl?: string;
      accessToken: string;
      refreshToken: string;
    },
    { rejectWithValue, signal }
  ) => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append("video", file);
      }
      formData.append("lessonId", lessonId);
      formData.append("sourcePlatform", sourcePlatform);
      formData.append("title", title);
      formData.append("description", description);
      if (youtubeUrl) {
        formData.append("embedUrl", youtubeUrl);
      }

      const response = await axiosInstance.post("/video/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Increase timeout for video uploads (10 minutes)
        timeout: 600000, // 10 minutes in milliseconds

        // Handle upload progress
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        },

        // Pass the abort signal from Redux Toolkit
        signal: signal,
      });
      window.location.reload();

      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.code === "ECONNABORTED") {
        return rejectWithValue("Upload timeout - please try again");
      }
      if (error.name === "AbortError") {
        return rejectWithValue("Upload was cancelled");
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchVideo = createAsyncThunk(
  "video/fetchVideo",
  async (
    {
      videoId,
    }: {
      videoId: string;
      accessToken: string;
      refreshToken: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(`/video/${videoId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateVideo = createAsyncThunk(
  "video/updateVideo",
  async (
    {
      videoId,
      file,
      lessonId,
      sourcePlatform,
      title,
      description,
      accessToken,
      refreshToken,
    }: {
      videoId: string;
      file: File;
      lessonId: string;
      sourcePlatform: string;
      title: string;
      description: string;
      accessToken: string;
      refreshToken: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("lessonId", lessonId);
      formData.append("sourcePlatform", sourcePlatform);
      formData.append("title", title);
      formData.append("description", description);

      const response = await axiosInstance.put(`/video/${videoId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
console.log("Video updated successfully:", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default videoSlice.reducer;
