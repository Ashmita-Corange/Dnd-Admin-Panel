import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";
import { getTenantFromURL } from "../../utils/getTenantFromURL";

// Interfaces
export interface SupportTicket {
  _id: string;
  subject: string;
  title?: string; // Keep title as optional for backward compatibility
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category?: string;
  customer?: string | { _id: string; name?: string; email?: string }; // ObjectId or populated user
  assignedTo?: string | { _id: string; name?: string; email?: string } | null; // ObjectId or populated user
  createdBy?: string;
  customerEmail?: string; // For backward compatibility
  customerName?: string; // For backward compatibility
  createdAt: string;
  updatedAt: string;
  orderId?: string | null;
  attachments?: any[];
  replies?: Array<{
    message: string;
    repliedBy: string | { _id: string; name?: string };
    repliedAt: string;
    isStaff: boolean;
  }>;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

interface FetchTicketParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, any>;
  sort?: Record<string, "asc" | "desc">;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SupportTicketState {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  searchQuery: string;
  filters: Record<string, any>;
}

const initialState: SupportTicketState = {
  tickets: [],
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

// Fetch tickets
export const fetchTickets = createAsyncThunk<
  { tickets: SupportTicket[]; pagination: Pagination },
  FetchTicketParams
>("tickets/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "createdAt",
      sortOrder = "desc",
      filters = {},
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    
    // Add sort parameters
    if (sortField) queryParams.append("sortBy", sortField);
    if (sortOrder) queryParams.append("sortOrder", sortOrder);

    // Format filters as JSON object for the API
    const apiFilters = {
      isDeleted: false, // Always exclude deleted tickets
      ...filters
    };
    
    if (Object.keys(apiFilters).length > 0) {
      queryParams.append("filters", JSON.stringify(apiFilters));
    }

    // Format search fields as JSON object for the API
    if (search && search.trim() !== "") {
      const searchFields = {
        subject: search.trim(),
        description: search.trim(),
        // Add other searchable fields as needed
      };
      queryParams.append("searchFields", JSON.stringify(searchFields));
    }

    const response = await axiosInstance.get(`/crm/tickets?${queryParams.toString()}`, {
      headers: {
        "x-tenant": getTenantFromURL(),
      },
    });
    
    const data = response.data;
    console.log("Fetched Tickets - Full Response:", data);
    console.log("Fetched Tickets - Data Structure:", data?.data);
    
    const { success } = data;
    
    if (success) {
      // Extract tickets from the actual API response structure
      const ticketsData = data?.data?.data || data?.data || []; // Updated to match new API structure
      const metaData = data?.data?.meta || {};
      
      console.log("Extracted Tickets Data:", ticketsData);
      console.log("Meta Data:", metaData);
      
      // Transform tickets to ensure compatibility
      const transformedTickets = ticketsData.map((ticket: any) => ({
        ...ticket,
        title: ticket.title || ticket.subject, // Map subject to title for backward compatibility
        // Handle status conversion from in_progress to in-progress for UI compatibility
        status: ticket.status === 'in_progress' ? 'in-progress' : ticket.status,
        // Extract customer info for backward compatibility
        customerName: ticket.customerName || 
                     (typeof ticket.customer === 'object' && ticket.customer?.name) || 
                     'N/A',
        customerEmail: ticket.customerEmail || 
                      (typeof ticket.customer === 'object' && ticket.customer?.email) || 
                      '',
        // Handle assignedTo field - extract name if it's an object
        assignedTo: typeof ticket.assignedTo === 'object' && ticket.assignedTo?.name 
                   ? ticket.assignedTo.name 
                   : ticket.assignedTo,
      }));
      
      return {
        tickets: transformedTickets,
        pagination: {
          total: metaData.total || ticketsData.length,
          page: metaData.page || 1,
          limit,
          totalPages: metaData.pages || Math.ceil((metaData.total || ticketsData.length) / limit),
        },
      };
    } else {
      return rejectWithValue("Failed to fetch tickets.");
    }
  } catch (error: any) {
    console.error("❌ fetchTickets error:", error);
    return rejectWithValue(
      error?.response?.data?.message || error?.message || "Something went wrong"
    );
  }
});

// Slice
const supportTicketSlice = createSlice({
  name: "tickets",
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
    setFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.filters = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {};
      state.searchQuery = "";
      state.pagination.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = Array.isArray(action.payload.tickets) ? action.payload.tickets : [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery, setPagination, setFilters, resetFilters, clearError } = supportTicketSlice.actions;

export default supportTicketSlice.reducer;
