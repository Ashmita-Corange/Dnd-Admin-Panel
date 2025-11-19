import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export type TrackingEvent = any; // keep generic; refine types if needed

export const fetchTrackingEvents = createAsyncThunk<
  TrackingEvent[],
  void,
  { rejectValue: string }
>("tracking/fetchEvents", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch("http://localhost:3000/api/track?limit=200");
    if (!res.ok) {
      const text = await res.text();
      return rejectWithValue(text || "Failed to fetch tracking events");
    }
    const json = await res.json();
    console.log("Fetched tracking events:", json);
    return json.events ?? [];
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
        state.error = action.payload as string || action.error.message || "Failed";
      });
  },
});

export const { clearTrackingState } = trackingSlice.actions;

export const selectTrackingState = (state: any) => state.tracking as TrackingState;

export default trackingSlice.reducer;
