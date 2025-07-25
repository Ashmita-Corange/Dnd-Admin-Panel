import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// Utility to get tenant from the current URL
const getTenantFromURL = (): string => {
  const host = window?.location?.hostname || "";
  return host.split(".")[0]; // assumes subdomain is tenant name
};

interface Module {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  allowedPermissions?: string[];
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

// Create Module
export const createModule = createAsyncThunk<Module, { name: string }>(
  "modules/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/module`, data, {
        headers: {
          "x-tenant": getTenantFromURL(),
        },
      });
      return response.data.body.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch Modules
export const fetchModules = createAsyncThunk<Module[]>(
  "modules/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/module`, {
        headers: {
          "x-tenant": getTenantFromURL(),
        },
      });

      const modules = response.data?.modules;

      if (!Array.isArray(modules)) {
        throw new Error("Invalid module response structure");
      }

      return modules;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update Module
export const updateModule = createAsyncThunk<
  Module,
  { id: string; data: Partial<Module> }
>(
  "modules/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/module?id=${id}`, data, {
        headers: {
          "x-tenant": getTenantFromURL(),
        },
      });
      return response.data.body.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete Module
export const deleteModule = createAsyncThunk<string, string>(
  "modules/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/module?id=${id}`, {
        headers: {
          "x-tenant": getTenantFromURL(),
        },
      });
      return id;
    } catch (err: any) {
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
      })
      .addCase(updateModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateModule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.modules.findIndex(m => m._id === action.payload._id);
        if (index !== -1) state.modules[index] = action.payload;
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = state.modules.filter(m => m._id !== action.payload);
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default moduleSlice.reducer;
