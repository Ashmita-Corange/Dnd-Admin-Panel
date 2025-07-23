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
  searchQuery: string;
  error: string | null;
}

const initialState: ModuleState = {
  modules: [],
  searchQuery: "",
  loading: false,
  error: null,
};

// API base URL

export const createModule = createAsyncThunk<Module, { name: string }>(
  "modules/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/module`, data);
      console.log("Module created successfully:", response.data);
      return response.data.body.data; // Adjust based on your API response structure
    } catch (err: any) {
      console.error("Error creating module:", err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to fetch modules
export const fetchModules = createAsyncThunk<Module[], any>(
  "modules/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching modules with search query:");
      const response = await axiosInstance.get(`/module`);
      console.log("Full response from API:", response.data);

      // Correct extraction of modules array
      const modules = response.data?.modules;

      console.log("Modules fetched successfully:", modules);
      if (!Array.isArray(modules)) {
        throw new Error("Invalid module response structure");
      }

      return modules;
    } catch (err: any) {
      console.error("Error fetching modules:", err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateModule = createAsyncThunk<
  Module,
  { id: string; data: Partial<Module> }
>("modules/update", async ({ id, name }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/module?id=${id}`, { name });
    console.log("Module updated successfully:", response.data);
    return response.data.body.data; // Adjust based on your API response structure
  } catch (err: any) {
    console.error("Error updating module:", err);
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteModule = createAsyncThunk<string, string>(
  "modules/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/module?id=${id}`);
      console.log("Module deleted successfully:", response.data);
      return id; // Return the ID of the deleted module
    } catch (err: any) {
      console.error("Error deleting module:", err);
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
      .addCase(createModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createModule.fulfilled, (state, action) => {
        state.loading = false;
        state.modules.push(action.payload);
      })
      .addCase(createModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
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
