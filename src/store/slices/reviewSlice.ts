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

// Fetch All Reviews (Paginated)
export const fetchReviews = createAsyncThunk<
  { reviews: Review[]; pagination: Pagination },
  { page?: number; limit?: number; productId?: string }
>(
  "reviews/fetchAll",
  async ({ page = 1, limit = 10, productId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (productId) params.append("productId", productId);

      const response = await axiosInstance.get(`/review?${params.toString()}`);
      console.log("Fetch Reviews Response:", response.data);
      const data = response.data?.data?.body?.data;

      return {
        reviews: data?.result || [],
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
  }
);

// Update Review
export const updateReview = createAsyncThunk<
  Review,
  { id: string; data: Partial<Review> }
>("reviews/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/review/${id}`, data);
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
