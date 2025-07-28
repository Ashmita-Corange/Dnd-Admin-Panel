import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice";

import dashboardReducer from "./slices/dashboard";
import modules from "./slices/moduleSlice";
import category from "./slices/categorySlice";
import tenantSlice from "./slices/tenant";
import roleSlice from "./slices/roles";
import user from "./slices/user";
import subcategory from "./slices/subCategory";
import attributeSlice from "./slices/attribute";
import variantSlice from "./slices/variant";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: user,
    modules: modules,
    category: category,
    subcategory: subcategory,
    dashboard: dashboardReducer,
    tenant: tenantSlice,
    role: roleSlice,
    attribute: attributeSlice,
    variant: variantSlice,
    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
