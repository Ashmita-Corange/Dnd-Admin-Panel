import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// Interfaces
interface EstimatedDeliveryDays {
  min: number;
  max: number;
}

interface WeightLimit {
  min: number;
  max: number;
}

interface DimensionsLimit {
  length: number;
  width: number;
  height: number;
}

interface SupportedRegion {
  country: string;
  states: string[];
  postalCodes: string[];
}

interface COD {
  available: boolean;
  fee: number;
}

interface AdditionalCharges {
  fuelSurcharge: number;
  remoteAreaSurcharge: number;
  oversizedSurcharge: number;
  dangerousGoodsSurcharge: number;
}

interface Customs {
  clearanceRequired: boolean;
  documentation: string[];
}

interface ProofOfDelivery {
  available: boolean;
  details: {
    consigneeName?: string;
    deliveryDate?: string;
    signature?: string;
  };
}

export interface Shipping {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shippingMethod:
    | "standard"
    | "express"
    | "overnight"
    | "international"
    | "pickup";
  cost: number;
  freeShippingThreshold?: number | null;
  estimatedDeliveryDays: EstimatedDeliveryDays;
  supportedRegions: SupportedRegion[];
  weightLimit?: WeightLimit | null;
  dimensionsLimit?: DimensionsLimit | null;
  carrier?: string;
  trackingAvailable: boolean;
  trackingNumber?: string;
  cod: COD;
  additionalCharges: AdditionalCharges;
  customs: Customs;
  proofOfDelivery: ProofOfDelivery;
  priority?: number | string;
  status: "active" | "inactive";
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FetchShippingParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, unknown>;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ShippingState {
  shippingList: Shipping[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
}

const initialState: ShippingState = {
  shippingList: [],
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

// Thunks

export const createShipping = createAsyncThunk<Shipping, Partial<Shipping>>(
  "shipping/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/shipping", data);
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchShipping = createAsyncThunk<
  { shippingList: Shipping[]; pagination: Pagination },
  FetchShippingParams
>("shipping/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      filters = {},
      sortField = "createdAt",
      sortOrder = "desc",
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    // Format filters as JSON object for the API
    const apiFilters = { ...(filters || {}) };
    if (Object.keys(apiFilters).length > 0) {
      queryParams.append("filters", JSON.stringify(apiFilters));
    }

    // Format search fields as JSON object for the API
    if (search && search.trim() !== "") {
      const searchFields = {
        name: search.trim(),
      };
      queryParams.append("searchFields", JSON.stringify(searchFields));
    }
    if (sortField) queryParams.append("sortBy", sortField);
    if (sortOrder) queryParams.append("sortOrder", sortOrder);

    const response = await axiosInstance.get(
      `/shipping?${queryParams.toString()}`
    );
    // Ensure shippingList is always an array for dropdown
    const data = response.data;
    const shippingList = Array.isArray(data?.shippingMethods)
      ? data.shippingMethods
      : Array.isArray(data?.shipping)
      ? data.shipping
      : [];

    return {
      shippingList,
      pagination: {
        total: data?.total || shippingList.length || 0,
        page: data?.page || 1,
        limit,
        totalPages: data?.totalPages || 0,
      },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchShippingById = createAsyncThunk<Shipping, string>(
  "shipping/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/shipping/${id}`);
      return response.data.shipping;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateShipping = createAsyncThunk<
  Shipping,
  { id: string; data: Partial<Shipping> }
>("shipping/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/shipping/${id}`, data);
    return response.data?.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteShipping = createAsyncThunk<string, string>(
  "shipping/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/shipping/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice

const shippingSlice = createSlice({
  name: "shipping",
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
      .addCase(fetchShipping.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipping.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingList = action.payload.shippingList;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchShipping.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createShipping.fulfilled, (state, action) => {
        state.shippingList.unshift(action.payload);
      })
      // .addCase(updateShipping.fulfilled, (state, action) => {
      //   const index = state.shippingList.findIndex(
      //     (s) => s._id === action.payload._id
      //   );
      //   if (index !== -1) state.shippingList[index] = action.payload;
      // })
      .addCase(deleteShipping.fulfilled, (state, action) => {
        state.shippingList = state.shippingList.filter(
          (s) => s._id !== action.payload
        );
      })
      .addCase(fetchShippingById.fulfilled, (state, action) => {
        const index = state.shippingList.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) {
          state.shippingList[index] = action.payload;
        } else {
          state.shippingList.push(action.payload);
        }
      });
  },
});

export const { setSearchQuery, setPagination, clearError } =
  shippingSlice.actions;

export default shippingSlice.reducer;
