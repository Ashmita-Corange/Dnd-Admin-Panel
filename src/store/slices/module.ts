import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../services/axiosConfig';

interface ModuleState {
    loading: boolean;
    error: string | null;
    data: any;
}

const initialState: ModuleState = {
    loading: false,
    error: null,
    data: null,
};

export const createModule = createAsyncThunk(
    'module/createModule',
    async (
        {
            courseId,
            title,
            description,
            order,
            estimatedDuration,
            isPublished,
            token,
        }: {
            courseId: string;
            title: string;
            description: string;
            order: number;
            estimatedDuration: number;
            isPublished: boolean;
            token: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await axiosInstance.post(
                '/module/',
                {
                    courseId,
                    title,
                    description,
                    order,
                    estimatedDuration,
                    isPublished,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const moduleSlice = createSlice({
    name: 'module',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createModule.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createModule.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(createModule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default moduleSlice.reducer;