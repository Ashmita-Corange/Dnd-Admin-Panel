import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosConfig';

interface Coupon {
    code: string;
    type: string;
    value: number;
    isActive: boolean;
    expiresAt: string;
    usageLimit: number;
    usedCount: number;
    minCartValue: number;
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
>('coupon/createCoupon', async (couponData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(
            '/coupon',
            couponData
        );
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create coupon');
    }
});



export const fetchCoupons = createAsyncThunk<
    Coupon[],
    void,
    { rejectValue: string }
>('coupon/fetchCoupons', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(
            '/coupon'
        );
        console.log('Fetched coupons:', response.data?.coupons?.data);
        return response.data?.coupons?.data || [];
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch coupons');
    }
});

const couponSlice = createSlice({
    name: 'coupon',
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
                // Optionally, add the new coupon to the list
                state.coupons.unshift(action.payload);
            })
            .addCase(createCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
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
                state.error = action.payload || 'Unknown error';
            });
            
    },
});

export default couponSlice.reducer;