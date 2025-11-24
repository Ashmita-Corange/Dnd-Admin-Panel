import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface Coupon {
  _id?: string;
  code: string;
  type: string;
  value: number;
  isActive: boolean;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  minCartValue: number;
  // allow extra fields returned by backend
  [key: string]: any;
}

interface CouponState {
  loading: boolean;
  error: string | null;
  coupons: Coupon[];
}

const initialState: CouponState = {
  loading: false,
  error: null,
  coupons: [],
};

export const createCoupon = createAsyncThunk<
  Coupon,
  Coupon,
  { rejectValue: string }
>("coupon/createCoupon", async (couponData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/coupon", couponData);
    const data = response.data?.coupon || response.data;
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create coupon"
    );
  }
});

export const fetchCoupons = createAsyncThunk<
  Coupon[],
  void,
  { rejectValue: string }
>("coupon/fetchCoupons", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/coupon");
    // support different shapes
    return (
      response.data?.coupons?.data ||
      response.data?.data ||
      response.data?.coupons ||
      response.data ||
      []
    );
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch coupons"
    );
  }
});

export const deleteCoupon = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("coupon/deleteCoupon", async (couponId, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/coupon/${couponId}`);
    return { id: couponId };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete coupon"
    );
  }
});

export const getCouponById = createAsyncThunk<
  Coupon,
  string,
  { rejectValue: string }
>("coupon/getCouponById", async (couponId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/coupon/${couponId}`);
    return response.data?.coupon || response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch coupon"
    );
  }
});

export const updateCoupon = createAsyncThunk<
  Coupon,
  { id: string; data: Partial<Coupon> },
  { rejectValue: string }
>("coupon/updateCoupon", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/coupon/${id}`, data);
    return response.data?.coupon || response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update coupon"
    );
  }
});

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons.unshift(action.payload);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      })
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter((c) => c._id !== action.payload.id);
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const idx = state.coupons.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1)
          state.coupons[idx] = { ...state.coupons[idx], ...action.payload };
      });
  },
});

export default couponSlice.reducer;
