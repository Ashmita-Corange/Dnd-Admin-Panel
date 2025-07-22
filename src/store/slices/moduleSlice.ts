// store/slices/moduleSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface Module {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  allowedPermissions?: string[]; // optional, but present in API
}


interface ModuleState {
  modules: Module[];
  loading: boolean;
  error: string | null;
}

const initialState: ModuleState = {
  modules: [],
  loading: false,
  error: null,
};

// API base URL

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api";

// Async thunk to fetch modules
export const fetchModules = createAsyncThunk<Module[], void>(
  "modules/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching modules from:", `${API_BASE_URL}/module`);
      const response = await axiosInstance.get(`${API_BASE_URL}/module`);
      console.log("Full response from API:", response.data);

      // Correct extraction of modules array
      const modules = response.data?.body?.data;

      if (!Array.isArray(modules)) {
        throw new Error("Invalid module response structure");
      }

      console.log("Modules fetched successfully:", modules);
      return modules;
    } catch (err: any) {
      console.error("Error fetching modules:", err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);



const moduleSlice = createSlice({
  name: "modules",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default moduleSlice.reducer;
