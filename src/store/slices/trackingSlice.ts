import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export type TrackingEvent = any; // keep generic; refine types if needed

type FetchParams = {
  productId?: string;
  type?: string;
  since?: string;
  limit?: number;
};

export const fetchTrackingEvents = createAsyncThunk<
  TrackingEvent[],
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

    const url = `${base}?${qp.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      return rejectWithValue(text || "Failed to fetch tracking events");
    }
    const json = await res.json();
    // prefer events array; fall back to raw payload if necessary
    const events = json?.events ?? json;
    return Array.isArray(events) ? events : [];
  } catch (err: any) {
    return rejectWithValue(err?.message ?? "Network error");
  }
});

type TrackingState = {
  events: TrackingEvent[];
  loading: boolean;
  error: string | null;
};

const initialState: TrackingState = {
  events: [],
  loading: false,
  error: null,
};

const trackingSlice = createSlice({
  name: "tracking",
  initialState,
  reducers: {
    // add any sync reducers if needed later
    clearTrackingState(state) {
      state.events = [];
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
        (state, action: PayloadAction<TrackingEvent[]>) => {
          state.events = action.payload;
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
