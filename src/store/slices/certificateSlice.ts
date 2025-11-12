import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface Certificate {
  _id: string;
  name: string;
  description?: string;
  file?: string;
  createdAt?: string;
}

interface Pagination {
  total: number;
  totalDocuments?: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CertificateState {
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
}

const initialState: CertificateState = {
  certificates: [],
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

export const createCertificate = createAsyncThunk(
  "certificates/create",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/certificates`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data?.data || response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCertificates = createAsyncThunk(
  "certificates/fetchAll",
  async (
    params: { page?: number; limit?: number; search?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const { page = 1, limit = 10, search = "" } = params;
      const qp = new URLSearchParams();
      qp.append("page", String(page));
      qp.append("limit", String(limit));
      if (search) qp.append("search", String(search));

      const response = await axiosInstance.get(
        `/certificates?${qp.toString()}`
      );
      const data =
        response.data?.data?.body?.data || response.data?.data || response.data;

      const result = data?.result || data?.docs || data?.data || data;

      const paginationSource = data || {};

      return {
        certificates: result || [],
        pagination: {
          total:
            paginationSource?.totalDocuments ?? paginationSource?.total ?? 0,
          totalDocuments: paginationSource?.totalDocuments ?? 0,
          page: paginationSource?.currentPage ?? paginationSource?.page ?? page,
          limit: limit,
          totalPages: paginationSource?.totalPages ?? 0,
        },
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCertificateById = createAsyncThunk(
  "certificates/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/certificates/${id}`);
      return response.data?.data || response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateCertificate = createAsyncThunk(
  "certificates/update",
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(
        `/certificates/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data?.data || response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteCertificate = createAsyncThunk(
  "certificates/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/certificates/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const certificateSlice = createSlice({
  name: "certificates",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = action.payload.certificates;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createCertificate.fulfilled, (state, action) => {
        if (action.payload) state.certificates.unshift(action.payload);
      })
      .addCase(updateCertificate.fulfilled, (state, action) => {
        const idx = state.certificates.findIndex(
          (c) => c._id === action.payload._id
        );
        if (idx !== -1) state.certificates[idx] = action.payload;
      })
      .addCase(deleteCertificate.fulfilled, (state, action) => {
        state.certificates = state.certificates.filter(
          (c) => c._id !== action.payload
        );
      })
      .addCase(fetchCertificateById.fulfilled, (state, action) => {
        const existing = state.certificates.find(
          (c) => c._id === action.payload._id
        );
        if (existing) Object.assign(existing, action.payload);
        else state.certificates.push(action.payload as Certificate);
      });
  },
});

export const { setSearchQuery } = certificateSlice.actions;

export default certificateSlice.reducer;
