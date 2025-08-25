import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// Interfaces
export interface PostalCode {
  code: string;
  price: number;
}

export interface CreateShippingZonePayload {
  shippingId: string;
  postalCodes: PostalCode[];
  isActive: boolean; // <-- add this
}

export interface UpdateShippingZonePayload {
  id: string;
  shippingId: string;
  postalCodes: PostalCode[];
  isActive: boolean; // <-- add this
}

export interface ZoneRegion {
  country: string;
  states?: string[];
  postalCodes?: string[];
}

export interface ShippingZone {
  _id: string;
  shippingId: string;
  postalCodes: PostalCode[];
  name?: string;
  slug?: string;
  description?: string;
  regions?: ZoneRegion[];
  shippingMethods?: string[];
  status?: "active" | "inactive";
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface FetchZoneParams {
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

interface ShippingZoneState {
  zoneList: ShippingZone[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
}

const initialState: ShippingZoneState = {
  zoneList: [],
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

// --- Thunks ---

// Create
export const createShippingZone = createAsyncThunk<
  ShippingZone,
  CreateShippingZonePayload
>("shippingZones/create", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/shipping-zones", data);
    return response.data?.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Read (list)
export const fetchShippingZones = createAsyncThunk<
  { zoneList: ShippingZone[]; pagination: Pagination },
  FetchZoneParams
>("shippingZones/fetchAll", async (params = {}, { rejectWithValue }) => {
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
      `/shipping-zones?${queryParams.toString()}`
    );

    const data = response.data;

    return {
      zoneList: data?.shippingZones || [],
      pagination: {
        total: data?.pagination?.totalItems || 0,
        page: data?.pagination?.currentPage || 1,
        limit: data?.pagination?.itemsPerPage || limit,
        totalPages: data?.pagination?.totalPages || 0,
      },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Update
export const updateShippingZone = createAsyncThunk<
  ShippingZone,
  UpdateShippingZonePayload
>(
  "shippingZones/update",
  async ({ id, shippingId, ...data }, { rejectWithValue }) => {
    try {
      // Use shippingId for endpoint
      const response = await axiosInstance.put(`/shipping-zones/${shippingId}`, data);

      // if API returns success but missing _id, fallback to id
      if (!response.data?.data) {
        return { _id: id, shippingId, ...data } as ShippingZone;
      }

      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// Delete
export const deleteShippingZone = createAsyncThunk<
  string,
  string
>("shippingZones/delete", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/shipping-zones/${id}`);
    return id; // return deleted id to remove from state
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Bulk Import Pincodes
export const bulkImportPincodes = createAsyncThunk<
  { success: boolean; message: string },
  { shippingId: string; file: File }
>("shippingZones/bulkImport", async ({ shippingId, file }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("shippingId", shippingId);
    formData.append("file", file);

    // If you need to add custom headers (token, tenant), do it here or in axios config
    const response = await axiosInstance.post("/shipping-zones/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
    
      },
    });
    return {
      success: true,
      message: response.data?.message || "Bulk import successful",
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// --- Slice ---
const shippingZoneSlice = createSlice({
  name: "shippingZones",
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
      // fetch all
      .addCase(fetchShippingZones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShippingZones.fulfilled, (state, action) => {
        state.loading = false;
        state.zoneList = action.payload.zoneList;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchShippingZones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // create
      .addCase(createShippingZone.fulfilled, (state, action) => {
        state.zoneList.unshift(action.payload);
      })
      // update
      .addCase(updateShippingZone.fulfilled, (state, action) => {
        if (!action.payload || !action.payload._id) {
          state.error = "Update succeeded but response is missing zone data (_id).";
          return;
        }
        const index = state.zoneList.findIndex(
          (zone) => zone._id === action.payload._id
        );
        if (index !== -1) {
          state.zoneList[index] = action.payload;
        }
      })
      // delete
      .addCase(deleteShippingZone.fulfilled, (state, action) => {
        state.zoneList = state.zoneList.filter(
          (zone) => zone._id !== action.payload
        );
      })
      // Bulk Import
      .addCase(bulkImportPincodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkImportPincodes.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(bulkImportPincodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, setPagination, clearError } =
  shippingZoneSlice.actions;

export default shippingZoneSlice.reducer;
