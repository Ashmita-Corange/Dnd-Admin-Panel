import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

export interface PlanFeature {
  key: string;
  value: string;
}

export interface PlanMetadata {
  [key: string]: any;
}

export interface Plan {
  _id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: PlanFeature[];
  availability: string;
  duration: number;
  discount: number;
  discountType: string;
  trialPeriod: number;
  trialPeriodType: string;
  isFeatured: boolean;
  metadata: PlanMetadata;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchPlanParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PlanState {
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

// Create plan
export const createPlan = createAsyncThunk<Plan, Partial<Plan>>(
  "plans/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/plan", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch paginated plans
export const fetchPlans = createAsyncThunk<
  { plans: Plan[]; pagination: Pagination },
  FetchPlanParams
>("plans/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "createdAt",
      sortOrder = "desc",
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);
    if (sortField) queryParams.append("sortBy", sortField);
    if (sortOrder) queryParams.append("sortOrder", sortOrder);

    const response = await axiosInstance.get(
      `/plan?${queryParams.toString()}`
    );
    const data = response.data?.data?.body?.data;

    return {
      plans: data?.result || [],
      pagination: {
        total: data?.total || 0,
        page: data?.page || 1,
        limit: limit,
        totalPages: data?.totalPages || 0,
      },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Fetch plan by ID
export const fetchPlanById = createAsyncThunk<Plan, string>(
  "plans/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/plan/${id}`);
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update plan
export const updatePlan = createAsyncThunk<
  Plan,
  { id: string; data: Partial<Plan> }
>("plans/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/plan/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data?.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Delete plan
export const deletePlan = createAsyncThunk<string, string>(
  "plans/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/plan/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice
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
    clearError: (state) => {
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
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter(
          (p) => p._id !== action.payload
        );
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        const index = state.plans.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.plans[index] = action.payload;
        } else {
          state.plans.push(action.payload);
        }
      });
  },
});

export const { setSearchQuery, setPagination, clearError } = planSlice.actions;

export default planSlice.reducer;
