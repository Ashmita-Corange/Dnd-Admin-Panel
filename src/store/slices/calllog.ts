// src/store/calllog.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";
import { getTenantFromURL } from "../../utils/getTenantFromURL";

// ====================== Types ======================
export interface CallLog {
  _id: string;
  caller: string;
  receiver: string;
  duration?: number;
  status?: string;
  type?: string;   // incoming, outgoing, missed etc.
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  status?: string;
  type?: string;
}

interface CallLogState {
  calllogs: CallLog[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
  filters: Filters;
}

// ====================== Initial State ======================
const initialState: CallLogState = {
  calllogs: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  searchQuery: "",
  filters: {},
};

// ====================== Async Thunk ======================

// Fetch Call Logs
export const fetchCallLogs = createAsyncThunk(
  "calllog/fetchCallLogs",
  async (params: any, { rejectWithValue }) => {
    try {
      const { filters, ...rest } = params;
      const queryParams = {
        ...rest,
        ...(filters || {}),
      };

      const response = await axiosInstance.get("/calllog", {
        params: queryParams,
        headers: { "x-tenant": getTenantFromURL() },
      });

      // Updated extraction based on API response
      const callLogs = response.data.callLogs;
      const pagination = response.data.pagination;
      console.log("Fetched call logs:", callLogs);

      return {
        data: callLogs,
        pagination: {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          total: pagination.totalItems,
          totalPages: pagination.totalPages,
        },
      };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// ====================== Slice ======================
const calllogSlice = createSlice({
  name: "calllog",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.pagination.page = 1;
    },
    setFilters: (state, action: PayloadAction<Filters>) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {};
      state.searchQuery = "";
      state.pagination.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchCallLogs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCallLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.calllogs = action.payload.data || [];
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    });
    builder.addCase(fetchCallLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setSearchQuery,
  setFilters,
  setPagination,
  resetFilters,
  clearError,
} = calllogSlice.actions;

export default calllogSlice.reducer;
