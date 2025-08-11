import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// Review Interface
export interface Review {
  _id?: string;
  rating: number;
  comment: string;
  productId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    name: string;
    email: string;
    // Add more if needed
  };
  isActive?: boolean; // <-- add this
}

// Pagination Interface
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// State Interface
export interface ReviewState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
  selectedReview?: Review | null;  // <-- new field
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  searchQuery: "",
  selectedReview: null,
};

// ================== Thunks ================== //

// Create Review
export const createReview = createAsyncThunk<Review, Partial<Review>>(
  "reviews/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/review", data);
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch All Reviews (Paginated, with filters/search/sort)
export const fetchReviews = createAsyncThunk<
  { reviews: Review[]; pagination: Pagination },
  {
    page?: number;
    limit?: number;
    productId?: string;
    filters?: Record<string, any>;
    search?: Record<string, any>;
    sort?: Record<string, any>;
  }
>(
  "reviews/fetchAll",
  async (
    { page = 1, limit = 10, productId, filters = {}, search = {}, sort = {} },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (productId) params.append("productId", productId);

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") params.append(key, value);
      });

      // Add search (only one field supported in backend, e.g. comment)
      if (search && typeof search === "object") {
        Object.entries(search).forEach(([key, value]) => {
          if (value !== undefined && value !== "") params.append("search", value);
        });
      }

      // Add sort (e.g. createdAt: "desc")
      if (sort && typeof sort === "object") {
        Object.entries(sort).forEach(([key, value]) => {
          params.append(`sort[${key}]`, value);
        });
      }

      const response = await axiosInstance.get(`/review/all?${params.toString()}`);
      const data = response.data;

      return {
        reviews: data?.data || [],
        pagination: {
          total: data?.pagination?.total || 0,
          page: data?.pagination?.page || 1,
          limit: data?.pagination?.limit || limit,
          totalPages: data?.pagination?.totalPages || 0,
        },
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch single Review by ID
export const fetchReviewById = createAsyncThunk<Review, string>(
  "reviews/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/review/${id}`);
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// Update Review
export const updateReview = createAsyncThunk<
  Review,
  { id: string; data: Partial<Review> | FormData }
>("reviews/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    let config = {};
    let payload = data;
    if (data instanceof FormData) {
      config = { headers: { "Content-Type": "multipart/form-data" } };
    }
    const response = await axiosInstance.put(`/review/${id}`, payload, config);
    return response.data?.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Delete Review
export const deleteReview = createAsyncThunk<string, string>(
  "reviews/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/review/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ================== Slice ================== //
const reviewSlice = createSlice({
  name: "reviews",
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
      // Fetch all
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single review by ID
      .addCase(fetchReviewById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedReview = null;
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReview = action.payload;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.selectedReview = null;
      })

      // Create
      .addCase(createReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload);
      })

      // Update
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(
          (r) => r._id === action.payload._id
        );
        if (index !== -1) state.reviews[index] = action.payload;
      })

      // Delete
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter((r) => r._id !== action.payload);
      });
  },
});

export const { setSearchQuery, setPagination, clearError } =
  reviewSlice.actions;
export default reviewSlice.reducer;
