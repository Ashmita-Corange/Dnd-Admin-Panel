import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";
import { getTenantFromURL } from "../../utils/getTenantFromURL";

// Types
export interface TemplateSettings {
  [key: string]: any;
}

export interface Component {
  componentType: string;
  componentVariant: string;
  componentSpan: number;
  sortOrder: number;
  isVisible: boolean;
  settings: TemplateSettings;
}

export interface Column {
  columnIndex: number;
  columnWidth: number;
  columnTitle: string;
  components: Component[];
}

export interface Template {
  _id?: string;
  productId: number;
  layoutId: number;
  layoutName: string;
  totalColumns: number;
  columnGap: number;
  componentGap: number;
  rowGap: number;
  columns: Column[];
  createdAt?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TemplateState {
  templates: Template[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
  filters: Record<string, any>;
}

const initialState: TemplateState = {
  templates: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  searchQuery: "",
  filters: {},
};

// Thunks

export const fetchTemplates = createAsyncThunk<
  { templates: Template[]; pagination: Pagination },
  {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
    search?: any;
    sort?: Record<string, any>;
  }
>("templates/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      filters = {},
      search = "",
      sort = {},
    } = params as any;

    const queryParams = new URLSearchParams();
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    // Add filters as simple key=value pairs
    if (filters && typeof filters === "object") {
      Object.keys(filters).forEach((k) => {
        if (filters[k] !== undefined && filters[k] !== "") {
          queryParams.append(k, String(filters[k]));
        }
      });
    }

    // Support search object or string; follow existing convention: send as searchFields JSON
    if (search) {
      queryParams.append("searchFields", JSON.stringify(search));
    }

    // Support sort
    if (sort && typeof sort === "object") {
      Object.keys(sort).forEach((k) => {
        if (sort[k] !== undefined && sort[k] !== "") {
          queryParams.append("sortBy", String(k));
          queryParams.append("sortOrder", String(sort[k]));
        }
      });
    }

    const url = `/template?${queryParams.toString()}`;
    const response = await axiosInstance.get(url, {
      headers: { "x-tenant": getTenantFromURL() },
    });
    console.log("Fetched templates:", response.data?.data);
    const data = response.data?.data || response.data;

    return {
      templates: data.result || [],
      pagination: {
        total: data.totalDocuments || data.total || 0,
        page: data.currentPage || page,
        limit: data.limit || limit,
        totalPages: data.totalPages || 0,
      },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchTemplateById = createAsyncThunk<Template, string>(
  "templates/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/template?id=${id}`);
      console.log("Fetched Template Data: ===>", response.data);
      return response?.data?.body?.data || response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createTemplate = createAsyncThunk<Template, Partial<Template>>(
  "templates/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/template", data, {
        headers: { "x-tenant": getTenantFromURL() },
      });
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateTemplate = createAsyncThunk<
  Template,
  { id: string; data: Partial<Template> }
>("templates/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/template?id=${id}`, data);
    return response.data?.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteTemplate = createAsyncThunk<string, string>(
  "templates/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/template?id=${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice

const templateSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters(state, action: PayloadAction<Record<string, any>>) {
      state.filters = action.payload;
    },
    resetFilters(state) {
      state.filters = {};
    },
    setPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
      if (action.payload.page !== undefined)
        state.pagination.page = action.payload.page;
      if (action.payload.limit !== undefined)
        state.pagination.limit = action.payload.limit;
    },
    clearTemplateError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.templates;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.unshift(action.payload);
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const index = state.templates.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) state.templates[index] = action.payload;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter(
          (t) => t._id !== action.payload
        );
      })
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        const index = state.templates.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) {
          state.templates[index] = action.payload;
        } else {
          state.templates.push(action.payload);
        }
      });
  },
});

export const {
  setSearchQuery,
  setFilters,
  resetFilters,
  setPagination,
  clearTemplateError,
} = templateSlice.actions;

export default templateSlice.reducer;
