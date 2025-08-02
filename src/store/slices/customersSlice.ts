import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";
import { getTenantFromURL } from "../../utils/getTenantFromURL";

// Interfaces
export interface CustomerRole {
  _id: string;
  name: string;
  scope: string;
  tenantId: string;
  modulePermissions: any[];
  createdAt: string;
  deletedAt: string | null;
  __v: number;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  role: CustomerRole | null;
  tenant: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  __v: number;
}

interface FetchCustomersParams {
  search?: string;
  filters?: Record<string, any>;
  sort?: Record<string, any>;
  page?: number;
  limit?: number;
}

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: Record<string, any>;
  total: number;
  page: number;
  limit: number;
}

const initialState: CustomerState = {
  customers: [],
  loading: false,
  error: null,
  searchQuery: "",
  filters: {},
  total: 0,
  page: 1,
  limit: 10,
};

// ✅ Fetch Customers
// store/slices/customersSlice.ts

export const fetchCustomers = createAsyncThunk<
  { customers: Customer[]; total: number; page: number; limit: number },
  void,
  { rejectValue: string }
>("customers/fetchCustomers", async (_, { getState, rejectWithValue }) => {
  const state = getState() as RootState;
  const tenant = getTenantFromURL();

  try {
    const response = await axiosInstance.get("/user", {
      headers: {
        "x-tenant": tenant,
      },
      params: {
        search: state.customers.searchQuery || undefined,
        page: state.customers.page,
        limit: state.customers.limit,
      },
    });

    const { success, users, total, page, limit } = response.data;

    console.log("✅ API Raw Data:", response.data);

    if (success) {
      const transformed = {
        customers: users,
        total,
        page,
        limit,
      };
      console.log("✅ Transformed Data to Return:", transformed);
      return transformed;
    } else {
      return rejectWithValue("Failed to fetch customers.");
    }
  } catch (error: any) {
    console.error("❌ fetchCustomers error:", error);
    return rejectWithValue(error?.message || "Something went wrong");
  }
});



// ✅ Delete Customer
export const deleteCustomer = createAsyncThunk<string, string>(
  "customers/delete",
  async (customerId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/user/${customerId}`, {
        headers: {
          "x-tenant": getTenantFromURL(),
        },
      });

      return customerId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Slice
const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setFilters(state, action: PayloadAction<Record<string, any>>) {
      state.filters = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },
    resetFilters(state) {
      state.filters = {};
      state.searchQuery = "";
      state.page = 1;
    },
    clearCustomerError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCustomers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.customers;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // deleteCustomer
      .addCase(deleteCustomer.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(
          (customer) => customer._id !== action.payload
        );
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// ✅ Exports
export const {
  setSearchQuery,
  setFilters,
  setPage,
  setLimit,
  resetFilters,
  clearCustomerError,
} = customersSlice.actions;

export default customersSlice.reducer;
