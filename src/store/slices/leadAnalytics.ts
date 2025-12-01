import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";
import { getTenantFromURL } from "../../utils/getTenantFromURL";

// Interfaces
export interface LeadAnalytics {
    overview: {
        totalLeads: number;
        newLeads: number;
        contactedLeads: number;
        assignedLeads: number;
        qualifiedLeads: number;
        convertedLeads: number;
        lostLeads: number;
        conversionRate: string;
        avgResponseTime: string;
    };
    callMetrics: {
        callNotAnswered: number;
        numberNotReachable: number;
        dealDone: number;
        callBack: number;
        interested: number;
        numberNotConnected: number;
        orderEnquiry: number;
        notInterested: number;
        switchOff: number;
        missedCalls: number;
    };
    followUpMetrics: {
        followupMissed: number;
        untouchedLeads: number;
        followupForToday: number;
        followupDoneToday: number;
        salesDoneThisMonth: number;
        closedLeads: number;
    };
    revenueMetrics: {
        totalExpectedRevenue: number;
        convertedRevenue: number;
        potentialRevenue: number;
        averageDealSize: number;
    };
    sourceBreakdown: {
        [key: string]: number;
    };
    teamPerformance: {
        topPerformers: Array<{
            userId: string;
            userName: string;
            totalLeads: number;
            convertedLeads: number;
            conversionRate: string;
            totalValue: number;
        }>;
        totalAssigned: number;
        unassignedLeads: number;
    };
    statusDistribution: {
        new: number;
        contacted: number;
        assigned: number;
        qualified: number;
        converted: number;
        lost: number;
    };
    timeMetrics: {
        today: {
            followUps: number;
            contacted: number;
        };
        thisMonth: {
            conversions: number;
        };
    };
}

interface FetchAnalyticsParams {
    startDate?: string;
    endDate?: string;
    assignedTo?: string;
}

interface LeadAnalyticsState {
    analytics: LeadAnalytics | null;
    loading: boolean;
    error: string | null;
    filters: {
        startDate: string;
        endDate: string;
        assignedTo: string;
    };
}

const initialState: LeadAnalyticsState = {
    analytics: null,
    loading: false,
    error: null,
    filters: {
        startDate: "",
        endDate: "",
        assignedTo: "",
    },
};

// Fetch lead analytics
export const fetchLeadAnalytics = createAsyncThunk<
    LeadAnalytics,
    FetchAnalyticsParams
>(
    "leadAnalytics/fetch",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();

            if (params.startDate) queryParams.append("startDate", params.startDate);
            if (params.endDate) queryParams.append("endDate", params.endDate);
            if (params.assignedTo) queryParams.append("assignedTo", params.assignedTo);

            const response = await axiosInstance.get(
                `/crm/leads/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
                {
                    headers: {
                        "x-tenant": getTenantFromURL(),
                    },
                }
            );

            console.log("Lead Analytics Response:", response.data);

            // API returns { success, message, data }
            if (response.data?.success && response.data?.data) {
                return response.data.data;
            } else {
                return rejectWithValue("Failed to fetch lead analytics.");
            }
        } catch (error: any) {
            console.error("❌ fetchLeadAnalytics error:", error);
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "Something went wrong"
            );
        }
    }
);

// Slice
const leadAnalyticsSlice = createSlice({
    name: "leadAnalytics",
    initialState,
    reducers: {
        setAnalyticsFilters: (
            state,
            action: PayloadAction<Partial<LeadAnalyticsState["filters"]>>
        ) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetAnalyticsFilters: (state) => {
            state.filters = {
                startDate: "",
                endDate: "",
                assignedTo: "",
            };
        },
        clearAnalyticsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeadAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLeadAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload;
            })
            .addCase(fetchLeadAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setAnalyticsFilters,
    resetAnalyticsFilters,
    clearAnalyticsError,
} = leadAnalyticsSlice.actions;

export default leadAnalyticsSlice.reducer;
