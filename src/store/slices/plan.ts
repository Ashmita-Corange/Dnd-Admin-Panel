// planSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

export interface Feature {
  key: string;
  value: string;
}

export interface Plan {
  _id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  features: Feature[];
  availability: "daily" | "weekly" | "monthly" | "yearly";
  duration: number;
  isActive: boolean;
  discount: number;
  discountType: "percentage" | "fixed";
  trialPeriod: number;
  trialPeriodType: "days" | "weeks" | "months";
  isFeatured: boolean;
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PlanState {
  plans: Plan[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
}

const initialState: PlanState = {
  plans: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  searchQuery: "",
};

export const createPlan = createAsyncThunk<Plan, Partial<Plan>>(
  "plans/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/plan", data);
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchPlans = createAsyncThunk<
  { plans: Plan[]; pagination: Pagination },
  {
    page?: number;
    limit?: number;
    search?: string;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    filters?: any;
  }
>("plans/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortField = "createdAt",
      sortOrder = "desc",
      filters = {},
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (search) queryParams.append("searchFields", JSON.stringify(search));
    if (Object.keys(filters).length > 0) {
      queryParams.append("filters", JSON.stringify(filters));
    }
    queryParams.append("sortBy", sortField);
    queryParams.append("sortOrder", sortOrder);

    const response = await axiosInstance.get(`/plan?${queryParams.toString()}`);
    const data = response.data.body.data;

    return {
      plans: data?.result || [],
      pagination: {
        total: data?.totalDocuments || 0,
        page: data?.currentPage || page,
        limit: data?.limit || limit,
        totalPages: data?.totalPages || 0,
      },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updatePlan = createAsyncThunk<
  Plan,
  { id: string; data: Partial<Plan> }
>("plans/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/plans/${id}`, data);
    return response.data?.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deletePlan = createAsyncThunk<string, string>(
  "plans/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/plan?id=${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const planSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
      if (action.payload.page !== undefined)
        state.pagination.page = action.payload.page;
      if (action.payload.limit !== undefined)
        state.pagination.limit = action.payload.limit;
    },
    clearPlanError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.plans;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.plans.unshift(action.payload);
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        const index = state.plans.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) state.plans[index] = action.payload;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((p) => p._id !== action.payload);
      });
  },
});

export const { setSearchQuery, setPagination, clearPlanError } =
  planSlice.actions;
export default planSlice.reducer;
