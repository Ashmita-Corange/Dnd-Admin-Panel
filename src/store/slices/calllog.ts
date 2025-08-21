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
  leadCallLogs: CallLog[]; // <-- Add this line
  leadCallLogsLoading: boolean; // <-- Add this line
  leadCallLogsError: string | null; // <-- Add this line
}

// ====================== Initial State ======================
const initialState: CallLogState = {
  calllogs: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  searchQuery: "",
  filters: {},
  leadCallLogs: [], // <-- Add this line
  leadCallLogsLoading: false, // <-- Add this line
  leadCallLogsError: null, // <-- Add this line
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

// Fetch Call Logs for a specific lead
export const fetchLeadCallLogs = createAsyncThunk(
  "calllog/fetchLeadCallLogs",
  async (leadId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/calllog/lead/${leadId}`, {
        headers: { "x-tenant": getTenantFromURL() },
      });
      // Assuming response.data.callLogs contains the call logs for the lead
      console.log("Fetched lead call logs:", response.data.callLogs);
      return response.data.callLogs;
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
    clearLeadCallLogs: (state) => {
      state.leadCallLogs = [];
      state.leadCallLogsError = null;
      state.leadCallLogsLoading = false;
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
    builder.addCase(fetchLeadCallLogs.pending, (state) => {
      state.leadCallLogsLoading = true;
      state.leadCallLogsError = null;
    });
    builder.addCase(fetchLeadCallLogs.fulfilled, (state, action) => {
      state.leadCallLogsLoading = false;
      state.leadCallLogs = action.payload || [];
    });
    builder.addCase(fetchLeadCallLogs.rejected, (state, action) => {
      state.leadCallLogsLoading = false;
      state.leadCallLogsError = action.payload as string;
    });
  },
});

export const {
  setSearchQuery,
  setFilters,
  setPagination,
  resetFilters,
  clearError,
  clearLeadCallLogs, // <-- Add this line
} = calllogSlice.actions;

export default calllogSlice.reducer;
