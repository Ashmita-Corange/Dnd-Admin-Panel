import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// Contact Interface
interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination Interface
interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

// Fetch Params
interface FetchContactParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

// State
interface ContactState {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
}

const initialState: ContactState = {
  contacts: [],
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

// ✅ Fetch Contacts (GET /contact)
export const fetchContacts = createAsyncThunk<
  { contacts: Contact[]; pagination: Pagination },
  FetchContactParams
>("contact/fetchAll", async (params = {}, { rejectWithValue }) => {
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
      `/contact?${queryParams.toString()}`
    );
    const data = response.data;

    return {
      contacts: data?.data || [],
      pagination: {
        total: data?.total || 0,
        page: data?.page || 1,
        limit: data?.limit || 10,
        totalPages: Math.ceil((data?.total || 0) / (data?.limit || 10)),
      },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ✅ Update Contact (PUT /contact/:id)
export const updateContact = createAsyncThunk<
  Contact,
  { id: string; data: Partial<Contact> }
>("contact/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/contact/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data?.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ✅ Fetch Contact by ID (GET /contact/:id)
export const fetchContactById = createAsyncThunk<Contact, string>(
  "contact/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/contact/${id}`);
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Slice
const contactSlice = createSlice({
  name: "contact",
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
      // Fetch contacts
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload.contacts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single contact
      .addCase(fetchContactById.fulfilled, (state, action) => {
        const index = state.contacts.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.contacts[index] = action.payload;
        } else {
          state.contacts.push(action.payload);
        }
      })

      // Update contact
      .addCase(updateContact.fulfilled, (state, action) => {
        const index = state.contacts.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
      });
  },
});

export const { setSearchQuery, setPagination, clearError } =
  contactSlice.actions;
export default contactSlice.reducer;
