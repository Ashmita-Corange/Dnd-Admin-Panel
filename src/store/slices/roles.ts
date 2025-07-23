import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// Interfaces
interface ModulePermission {
  module: string; // Module ID
  permissions: string[]; // Array of permission strings
}

export interface Role {
  _id: string;
  name: string;
  scope: "global" | "tenant";
  tenantId?: string;
  modulePermissions: ModulePermission[];
  createdAt: string;
}

interface FetchRoleParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, any>;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RoleState {
  roles: Role[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
}

// Initial State
const initialState: RoleState = {
  roles: [],
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

// Create Role
export const createRole = createAsyncThunk<Role, Partial<Role>>(
  "roles/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/role", data);
      return response.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch all roles
export const fetchRoles = createAsyncThunk<
  { roles: Role[]; pagination: Pagination },
  FetchRoleParams
>("roles/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortField = "createdAt",
      sortOrder = "desc",
      filters = {},
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (search) queryParams.append("searchFields", JSON.stringify(search));
    // if (Object.keys(filters).length > 0) {
    //   queryParams.append("filters", JSON.stringify(filters));
    // }
    // queryParams.append("sortBy", sortField);
    // queryParams.append("sortOrder", sortOrder);

    const response = await axiosInstance.get(`/role?${queryParams.toString()}`);
    console.log("Full response from API:", response.data);
    const data = response.data.body.data;

    return {
      roles: data?.result || [],
      pagination: {
        total: data?.totalDocuments || 0,
        page: data?.currentPage || page,
        limit: data?.limit || limit,
        totalPages: data?.totalPages || 0,
      },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Fetch role by ID
export const fetchRoleById = createAsyncThunk<Role, string>(
  "roles/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/role?id=${id}`);
      return response.data?.body.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update Role
export const updateRole = createAsyncThunk<
  Role,
  { id: string; data: Partial<Role> }
>("roles/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/role?id=${id}`, data);

    return response.data?.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Delete Role
export const deleteRole = createAsyncThunk<string, string>(
  "roles/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/role?id=${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice
const roleSlice = createSlice({
  name: "roles",
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
    clearRoleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.roles;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.unshift(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        // const index = state.roles.findIndex(
        //   (r) => r._id === action.payload._id
        // );
        // if (index !== -1) state.roles[index] = action.payload;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r._id !== action.payload);
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        const index = state.roles.findIndex(
          (r) => r._id === action.payload._id
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        } else {
          state.roles.push(action.payload);
        }
      });
  },
});

export const { setSearchQuery, setPagination, clearRoleError } =
  roleSlice.actions;

export default roleSlice.reducer;
