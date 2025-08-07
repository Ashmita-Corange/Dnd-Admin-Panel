import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosConfig';

interface CTAContent {
    title: string;
    link: string;
}

interface CountdownContent {
    endDate: string;
}

interface CardContent {
    tag: string;
    title: string;
    description: string;
}

interface SectionContent {
    title?: string;
    description?: string;
    tagline?: string;
    cta?: CTAContent;
    image?: string;
    image_name?: string;
    image_size?: number;
    image_type?: string;
    countdown?: CountdownContent;
    points?: string[];
    cards?: CardContent[];
}

interface CreatedByUser {
    _id: string;
    name: string;
    email: string;
}

interface Section {
    _id: string;
    sectionType: string;
    order: number;
    isVisible: boolean;
    content: SectionContent;
    createdBy: CreatedByUser;
    updatedBy: CreatedByUser;
    __v: number;
    createdAt: string;
    updatedAt: string;
}

interface SectionStats {
    total: number;
    visible: number;
    hidden: number;
}

interface GroupedSections {
    hero?: Section[];
    categoryPick?: Section[];
    offerBanner?: Section[];
    productSlider?: Section[];
    whyUs?: Section[];
    uniqueSellingPoints?: Section[];
}

interface ContentState {
    sections: GroupedSections;
    stats: Record<string, SectionStats>;
    totalSectionTypes: number;
    totalSections: number;
    loading: boolean;
    error: string | null;
    updateLoading: boolean;
}

const initialState: ContentState = {
    sections: {},
    stats: {},
    totalSectionTypes: 0,
    totalSections: 0,
    loading: false,
    error: null,
    updateLoading: false,
};

export const fetchHomePageContent = createAsyncThunk<
    { sections: GroupedSections; stats: Record<string, SectionStats>; totalSectionTypes: number; totalSections: number },
    void,
    { rejectValue: string }
>('content/fetchHomePageContent', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/content', {
            params: { action: 'grouped' },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console?.log('Fetched content:', response.data?.data);
        return {
            sections: response.data.data,
            stats: response.data.stats,
            totalSectionTypes: response.data.totalSectionTypes,
            totalSections: response.data.totalSections
        };
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch content');
    }
});

export const updateSectionContent = createAsyncThunk<
    Section,
    { sectionId: string; content: SectionContent; image?: File },
    { rejectValue: string }
>('content/updateSectionContent', async ({ sectionId, content, image }, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        
        // Send content as JSON string - matching your API expectations
        formData.append('content', JSON.stringify(content));
        
        // Add optional fields that your API might expect
        // You can get sectionType from the Redux state or pass it as parameter
        // For now, we'll extract it from the current section data
        
        if (image) {
            formData.append('image', image);
        }

        const response = await axiosInstance.put(
            `/content?id=${sectionId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update content');
    }
});

const contentSlice = createSlice({
    name: 'content',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHomePageContent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHomePageContent.fulfilled, (state, action) => {
                state.loading = false;
                state.sections = action.payload.sections;
                state.stats = action.payload.stats;
                state.totalSectionTypes = action.payload.totalSectionTypes;
                state.totalSections = action.payload.totalSections;
            })
            .addCase(fetchHomePageContent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error fetching content';
            })
            .addCase(updateSectionContent.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateSectionContent.fulfilled, (state, action) => {
                state.updateLoading = false;
                const updatedSection = action.payload;
                const sectionType = updatedSection.sectionType;
                
                if (state.sections[sectionType]) {
                    const index = state.sections[sectionType].findIndex(
                        section => section._id === updatedSection._id
                    );
                    if (index !== -1) {
                        state.sections[sectionType][index] = updatedSection;
                    }
                }
            })
            .addCase(updateSectionContent.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload || 'Error updating content';
            });
    },
});

export const { clearError } = contentSlice.actions;
export default contentSlice.reducer;