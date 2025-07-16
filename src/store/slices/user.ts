// userSlice.ts - Fixed version
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";
import axios from "axios";

export interface FetchUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_premium?: boolean;
  is_active?: boolean;
  is_blocked?: boolean;
  created_after?: string;
  created_before?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export const fetchAllUsers = createAsyncThunk<
  { users: any[]; pagination: any },
  FetchUsersParams
>("users/fetchAll", async (params: FetchUsersParams = {}, { rejectWithValue }) => {
  try {
    console.log("Fetching users with params:", params);
    
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", String(params.page));
    if (params.page_size) queryParams.append("page_size", String(params.page_size));
    if (params.search) queryParams.append("search", params.search);
    if (params.is_premium !== undefined) queryParams.append("is_premium", String(params.is_premium));
    if (params.is_active !== undefined) queryParams.append("is_active", String(params.is_active));
    if (params.is_blocked !== undefined) queryParams.append("is_blocked", String(params.is_blocked));
    if (params.created_after) queryParams.append("created_after", params.created_after);
    if (params.created_before) queryParams.append("created_before", params.created_before);
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);

    const queryString = queryParams.toString();
    const url =`/health/`; // Use a valid endpoint for testing, e.g., `/users` if needed
    
    console.log("Making request to URL:", url);

    // Use axiosInstance with relative URL - it already has the baseURL configured
    const response = await axiosInstance.get(url, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    console.log("Users API response:", response);
    
    const data = response.data?.data;

    return {
      users: data?.users || [],
      pagination: data?.pagination || {},
    };
  } catch (error: any) {
    console.error("Fetch users error:", error);
    console.error("Error response:", error.response);
    console.error("Error config:", error.config);
    
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch users";
    return rejectWithValue(errorMessage);
  }
});

// Alternative function with explicit token handling (if needed)
export const fetchAllUsersWithExplicitAuth = createAsyncThunk<
  { users: any[]; pagination: any },
  FetchUsersParams
>("users/fetchAllWithAuth", async (params: FetchUsersParams = {}, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", String(params.page));
    if (params.page_size) queryParams.append("page_size", String(params.page_size));
    if (params.search) queryParams.append("search", params.search);
    if (params.is_premium !== undefined) queryParams.append("is_premium", String(params.is_premium));
    if (params.is_active !== undefined) queryParams.append("is_active", String(params.is_active));
    if (params.is_blocked !== undefined) queryParams.append("is_blocked", String(params.is_blocked));
    if (params.created_after) queryParams.append("created_after", params.created_after);
    if (params.created_before) queryParams.append("created_before", params.created_before);
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    if (!token) {
      return rejectWithValue("No authentication token found");
    }

    const queryString = queryParams.toString();
    const url = `/users${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(`
http://test.swarnsiddhi.com/admin/api/v1/health/`, {
     
    });

    const data = response.data?.data;

    return {
      users: data?.users || [],
      pagination: data?.pagination || {},
    };
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// User slice state and reducers
export interface UserState {
  users: any[];
  userDetails: any | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: Record<string, any>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: UserState = {
  users: [],
  userDetails: null,
  loading: false,
  error: null,
  searchQuery: "",
  filters: {},
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserDetails: (state) => {
      state.userDetails = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.pagination.page = 1;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    resetFilters: (state) => {
      state.searchQuery = "";
      state.filters = {};
      state.pagination.page = 1;
    },
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.users = [];
      })
      // Handle the alternative function as well
      .addCase(fetchAllUsersWithExplicitAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsersWithExplicitAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAllUsersWithExplicitAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.users = [];
      });
  },
});

export const {
  clearUserDetails,
  setSearchQuery,
  setFilters,
  resetFilters,
  setCurrentPage,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;

// Selector to get all users
export const getAllUsers = (state: { users: UserState }) => state.users;