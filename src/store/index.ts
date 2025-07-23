import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice";
import CategoryReducer from "./slices/categorySlice";

import anayltics from "./slices/anayltics";

import dashboardReducer from "./slices/dashboard";

import user from "./slices/user";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    category: CategoryReducer,
    users: user,
    analytics: anayltics,
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
