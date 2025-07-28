import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// Interfaces
export interface Attribute {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  values: string[];
  status: "active" | "inactive";
  deletedAt: Date | null;
  createdAt: string;
  updatedAt: string;
}

interface FetchAttributeParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AttributeState {
  attributes: Attribute[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
}

const initialState: AttributeState = {
  attributes: [],
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

// Create attribute
export const createAttribute = createAsyncThunk<Attribute, Partial<Attribute>>(
  "attributes/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("attribute", data);
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch attributes with pagination
export const fetchAttributes = createAsyncThunk<
  { attributes: Attribute[]; pagination: Pagination },
  FetchAttributeParams
>("attributes/fetchAll", async (params = {}, { rejectWithValue }) => {
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
      `/attribute?${queryParams.toString()}`
    );
    const data = response.data?.data;

    return {
      attributes: data?.result || [],
      pagination: {
        total: data?.totalDocuments || 0,
        page: data?.currentPage || 1,
        limit,
        totalPages: data?.totalPages || 0,
      },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Fetch attribute by ID
export const fetchAttributeById = createAsyncThunk<Attribute, string>(
  "attributes/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/attribute/${id}`);
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update attribute
export const updateAttribute = createAsyncThunk<
  Attribute,
  { id: string; data: Partial<Attribute> }
>("attributes/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/attribute/${id}`, data);
    return response.data?.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Delete attribute
export const deleteAttribute = createAsyncThunk<string, string>(
  "attributes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/attribute/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice
const attributeSlice = createSlice({
  name: "attributes",
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
      .addCase(fetchAttributes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        state.loading = false;
        state.attributes = action.payload.attributes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createAttribute.fulfilled, (state, action) => {
        state.attributes.unshift(action.payload);
      })
      .addCase(updateAttribute.fulfilled, (state, action) => {
        const index = state.attributes.findIndex(
          (attr) => attr._id === action.payload._id
        );
        if (index !== -1) {
          state.attributes[index] = action.payload;
        }
      })
      .addCase(deleteAttribute.fulfilled, (state, action) => {
        state.attributes = state.attributes.filter(
          (attr) => attr._id !== action.payload
        );
      })
      .addCase(fetchAttributeById.fulfilled, (state, action) => {
        const index = state.attributes.findIndex(
          (attr) => attr._id === action.payload._id
        );
        if (index !== -1) {
          state.attributes[index] = action.payload;
        } else {
          state.attributes.push(action.payload);
        }
      });
  },
});

export const { setSearchQuery, setPagination, clearError } =
  attributeSlice.actions;

export default attributeSlice.reducer;
