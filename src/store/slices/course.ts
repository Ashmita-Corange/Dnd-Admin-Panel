import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface CategoryState {
  loading: boolean;
  error: string | null;
  data: any;
}

const initialState: CategoryState = {
  loading: false,
  error: null,
  data: null,
};

// Create Category
export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      console.log("Creating category with data:", formData);
      const response = await axiosInstance.post("/categories/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Categories with Pagination
interface PaginationData {
  categories: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchCategories = createAsyncThunk<
  PaginationData,
  { page?: number; limit?: number } | undefined
>("category/fetchCategories", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params;
    const response = await axiosInstance.get("/categories/", {
      params: { page, limit },
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data?.data;
    return {
      categories: data?.data || [],
      total: data?.total || 0,
      page: data?.page || 1,
      limit: data?.limit || 10,
      totalPages: data?.totalPages || 0,
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
});

// Fetch Category by ID
export const fetchCategoryById = createAsyncThunk(
  "category/fetchCategoryById",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/categories/${categoryId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data?.data?.category;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update Category
export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      console.log("Updating category with ID:", id, "and data:", data);

      const response = await axiosInstance.put(`/categories/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default categorySlice.reducer;

// Selector to get all categories
export const getAllCategories = (state: any) =>
  state.category?.data?.categories || [];
