import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export type TrackingEvent = any;

type FetchParams = {
  productId?: string;
  type?: string;
  since?: string;
  from?: string;
  to?: string;
  limit?: number;
};

// Updated response type to match API
type TrackingResponse = {
  success: boolean;
  count: number;
  events: TrackingEvent[];
  user: any;
  addresses: any[];
  addressesByUser: Record<string, any>;
  eventTotals: Record<string, number>;
};

export const fetchTrackingEvents = createAsyncThunk<
  TrackingResponse,
  FetchParams | undefined,
  { rejectValue: string }
>("tracking/fetchEvents", async (params = {}, { rejectWithValue }) => {
  try {
    const base = "http://localhost:3000/api/track";
    const qp = new URLSearchParams();

    // defaults
    const limit = params.limit ?? 200;
    qp.append("limit", String(limit));

    if (params.productId) qp.append("productId", params.productId);
    if (params.type) qp.append("type", params.type);
    if (params.since) qp.append("since", params.since);
    if (params.from) qp.append("from", params.from);
    if (params.to) qp.append("to", params.to);

    const url = `${base}?${qp.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      return rejectWithValue(text || "Failed to fetch tracking events");
    }
    const json = await res.json();
    // Return the full response object
    return json;
  } catch (err: any) {
    return rejectWithValue(err?.message ?? "Network error");
  }
});

type TrackingState = {
  data: TrackingResponse | null;
  loading: boolean;
  error: string | null;
};

const initialState: TrackingState = {
  data: null,
  loading: false,
  error: null,
};

const trackingSlice = createSlice({
  name: "tracking",
  initialState,
  reducers: {
    clearTrackingState(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrackingEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTrackingEvents.fulfilled,
        (state, action: PayloadAction<TrackingResponse>) => {
          state.data = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchTrackingEvents.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || "Failed";
      });
  },
});

export const { clearTrackingState } = trackingSlice.actions;

export const selectTrackingState = (state: any) =>
  state.tracking as TrackingState;

export default trackingSlice.reducer;