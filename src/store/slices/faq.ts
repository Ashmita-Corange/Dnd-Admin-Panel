// src/store/faqSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosConfig';
import { getTenantFromURL } from "../../utils/getTenantFromURL";

// ====================== Types ======================
export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  type?: string;
  status?: string;
  product?: string; // <-- add product field
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

interface FAQState {
  faqs: FAQ[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
  filters: Filters;
}

// ====================== Initial State ======================
const initialState: FAQState = {
  faqs: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  searchQuery: "",
  filters: {},
};

// ====================== Async Thunks ======================

// Fetch FAQs with pagination, filters, search
export const fetchFaqs = createAsyncThunk(
  "faq/fetchFaqs",
  async (params: any, { rejectWithValue }) => {
    try {
      const { filters, ...rest } = params;
      const queryParams = {
        ...rest,
        ...(filters || {}), // flatten filters
      };

      const response = await axiosInstance.get("/faqs", {
        params: queryParams,
        headers: { "x-tenant": getTenantFromURL() }
      });

      console.log(response.data);

      const { faqs } = response.data;
      return {
        data: faqs.data,
        pagination: {
          page: faqs.page,
          limit: faqs.limit,
          total: faqs.total,
          totalPages: Math.ceil(faqs.total / faqs.limit)
        }
      };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);



// Create FAQ
export const createFaq = createAsyncThunk(
  "faq/createFaq",
  async (faqData: Omit<FAQ, "_id">, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/faqs", faqData, {
        headers: {
          "x-tenant": getTenantFromURL(),
        },
      });
      return response.data.faq || response.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);
// ====================== Update FAQ ======================
export const updateFaq = createAsyncThunk(
  "faq/updateFaq",
  async ({ id, faqData }: { id: string; faqData: Partial<FAQ> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/faqs/${id}`, faqData, {
        headers: {
          "x-tenant": getTenantFromURL(),
        },
      });
      return response.data; // should return the updated FAQ object
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// Delete FAQ
export const deleteFaq = createAsyncThunk(
  "faq/deleteFaq",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/faqs/${id}`, {
        headers: {
          "x-tenant": getTenantFromURL(),
        },
      });
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// ====================== Slice ======================
const faqSlice = createSlice({
  name: "faq",
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
  clearError: (state) => { // ✅ standalone reducer
    state.error = null;
  },
},

  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchFaqs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFaqs.fulfilled, (state, action) => {
      state.loading = false;
      state.faqs = action.payload.data || [];
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    });
    builder.addCase(fetchFaqs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create
    builder.addCase(createFaq.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createFaq.fulfilled, (state, action) => {
      state.loading = false;
      state.faqs.unshift(action.payload); // action.payload is now the created FAQ object
    });
    builder.addCase(createFaq.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update
builder.addCase(updateFaq.pending, (state) => {
  state.loading = true;
});
builder.addCase(updateFaq.fulfilled, (state, action) => {
  state.loading = false;
  state.faqs = state.faqs.map((faq) =>
    faq._id === action.payload._id ? action.payload : faq
  );
});
builder.addCase(updateFaq.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload as string;
});


    // Delete
    builder.addCase(deleteFaq.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteFaq.fulfilled, (state, action) => {
      state.loading = false;
      state.faqs = state.faqs.filter((faq) => faq._id !== action.payload);
    });
    builder.addCase(deleteFaq.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSearchQuery, setFilters, setPagination, resetFilters, clearError } = faqSlice.actions;

export default faqSlice.reducer;
