import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice";

import dashboardReducer from "./slices/dashboard";
import modules from "./slices/moduleSlice";
import category from "./slices/categorySlice";

import user from "./slices/user";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: user,
    modules: modules,
    category: category,
    dashboard: dashboardReducer,
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
