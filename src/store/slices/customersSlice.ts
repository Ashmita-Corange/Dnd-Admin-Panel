import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";
import { getTenantFromURL } from "../../utils/getTenantFromURL";
import { RootState } from "../index";

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
  role?: string;
}

interface CreateCustomerParams {
  name: string;
  email: string;
  password: string;
  role: string;
  isSuperAdmin: boolean;
}

interface UpdateCustomerParams {
  id: string;
  data: Partial<{
    name: string;
    email: string;
    role: string;
    isSuperAdmin: boolean;
    isActive: boolean;
    isDeleted: boolean;
  }>;
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

// ✅ Fetch Single Customer by ID
export const fetchCustomerById = createAsyncThunk<
  Customer,
  string,
  { rejectValue: string }
>("customers/fetchById", async (customerId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/user/${customerId}`, {
      headers: {
        "x-tenant": getTenantFromURL(),
      },
    });

    const { success, user } = response.data;

    if (success) {
      return user;
    } else {
      return rejectWithValue("Failed to fetch customer.");
    }
  } catch (error: any) {
    console.error("❌ fetchCustomerById error:", error);
    return rejectWithValue(error?.message || "Something went wrong");
  }
});

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
    const params: any = {
      page: state.customers.page,
      limit: state.customers.limit,
    };

    if (state.customers.searchQuery) {
      params.searchFields = JSON.stringify({
        name: state.customers.searchQuery,
        email: state.customers.searchQuery,
      });
    }

    // Add role filter if it exists
    if (state.customers.filters.role) {
      params.role = state.customers.filters.role;
    }

    // Add explicit filters for analytics drill-down
    if (state.customers.filters.repeatcustomers) {
      params.repeatcustomers = state.customers.filters.repeatcustomers;
    }
    if (state.customers.filters.newcustomers) {
      params.newcustomers = state.customers.filters.newcustomers;
    }
    if (state.customers.filters.buys) {
      params.buys = state.customers.filters.buys;
    }
    if (state.customers.filters.startDate) {
      params.startDate = state.customers.filters.startDate;
    }
    if (state.customers.filters.endDate) {
      params.endDate = state.customers.filters.endDate;
    }

    console.log("Final API params:", params);

    const response = await axiosInstance.get("/user", {
      headers: {
        "x-tenant": tenant,
      },
      params,
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

// ✅ Create Customer
export const createCustomer = createAsyncThunk<
  Customer,
  CreateCustomerParams,
  { rejectValue: string }
>("customers/create", async (customerData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/user", customerData, {
      headers: {
        "x-tenant": getTenantFromURL(),
        "Content-Type": "application/json",
      },
    });

    const { success, user } = response.data;

    if (success) {
      return user;
    } else {
      return rejectWithValue("Failed to create customer.");
    }
  } catch (error: any) {
    console.error("❌ createCustomer error:", error);
    return rejectWithValue(
      error?.response?.data?.message || error?.message || "Something went wrong"
    );
  }
});

// ✅ Update Customer
export const updateCustomer = createAsyncThunk<
  Customer,
  UpdateCustomerParams,
  { rejectValue: string }
>("customers/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/user?id=${id}`, data, {
      headers: {
        "x-tenant": getTenantFromURL(),
        "Content-Type": "application/json",
      },
    });

    const { success, user } = response.data;

    if (success) {
      return user;
    } else {
      return rejectWithValue("Failed to update customer.");
    }
  } catch (error: any) {
    console.error("❌ updateCustomer error:", error);
    return rejectWithValue(
      error?.response?.data?.message || error?.message || "Something went wrong"
    );
  }
});

// ✅ Delete Customer
export const deleteCustomer = createAsyncThunk<string, string>(
  "customers/delete",
  async (customerId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/user?id=${customerId}`, {
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
      // fetchCustomerById
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        // Update the customer in the list if it exists, otherwise add it
        const existingIndex = state.customers.findIndex(
          (c) => c._id === action.payload._id
        );
        if (existingIndex >= 0) {
          state.customers[existingIndex] = action.payload;
        } else {
          state.customers.push(action.payload);
        }
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createCustomer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload); // Add new customer to the beginning
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updateCustomer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload._id) {
          state.customers = state.customers.map((customer) =>
            customer._id === action.payload._id ? action.payload : customer
          );
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
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
