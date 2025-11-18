import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface Brand {
  _id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  country: string;
  isFeatured: boolean;
  status: boolean;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FetchBrandParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";

  // optional arbitrary filters that will be appended as query params
  filters?: Record<string, string | number | boolean>;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BrandState {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
}

const initialState: BrandState = {
  brands: [],
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

// Create brand
export const createBrand = createAsyncThunk<Brand, Partial<Brand>>(
  "brands/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/brand", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch brands
export const fetchBrands = createAsyncThunk<
  { brands: Brand[]; pagination: Pagination },
  FetchBrandParams
>("brands/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "createdAt",
      sortOrder = "desc",
      filters = {},
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);
    if (sortField) queryParams.append("sortBy", sortField);
    if (sortOrder) queryParams.append("sortOrder", sortOrder);
    if (filters && Object.keys(filters).length) {
      queryParams.append("filters", JSON.stringify(filters));
    }

    const response = await axiosInstance.get(
      `/brand?${queryParams.toString()}`
    );

    console.log("Brand data:", response.data);
    const data = response.data;

    return {
      brands: data?.data || [],
      pagination: {
        total: data?.totalCount ?? data?.total ?? 0,
        page: data?.page ?? data?.currentPage ?? 1,
        // keep the requested limit to avoid toggling between undefined and a number
        limit: limit,
        totalPages: data?.totalPages ?? 0,
      },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Fetch brand by ID
export const fetchBrandById = createAsyncThunk<Brand, string>(
  "brands/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/brand/${id}`);
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update brand
export const updateBrand = createAsyncThunk<
  Brand,
  { id: string; data: Partial<Brand> }
>("brands/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/brand/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Delete brand
export const deleteBrand = createAsyncThunk<string, string>(
  "brands/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/brand/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice
const brandSlice = createSlice({
  name: "brands",
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
      // Fetch brands
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload.brands;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createBrand.fulfilled, (state, action) => {
        state.brands.unshift(action.payload);
      })

      // Update
      .addCase(updateBrand.fulfilled, (state, action) => {
        const index = state.brands.findIndex(
          (b) => b._id === action.payload._id
        );
        if (index !== -1) {
          state.brands[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter((b) => b._id !== action.payload);
      })

      // Fetch by ID
      .addCase(fetchBrandById.fulfilled, (state, action) => {
        const index = state.brands.findIndex(
          (b) => b._id === action.payload._id
        );
        if (index !== -1) {
          state.brands[index] = action.payload;
        } else {
          state.brands.push(action.payload);
        }
      });
  },
});

export const { setSearchQuery, setPagination, clearError } = brandSlice.actions;
export default brandSlice.reducer;
