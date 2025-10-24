import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice";

import dashboardReducer from "./slices/dashboard";
import modules from "./slices/moduleSlice";
import category from "./slices/categorySlice";
import tenantSlice from "./slices/tenant";
import roleSlice from "./slices/roles";
import user from "./slices/user";
import subcategory from "./slices/subCategory";
import attributeSlice from "./slices/attributeSlice";
import variantSlice from "./slices/variant";
import plan from "./slices/plan";
import productSlice from "./slices/product";
import templateSlice from "./slices/template";
import couponSlice from "./slices/coupon";
import blogSlice from "./slices/blog";
import leadSlice from "./slices/lead";
import supportTicketSlice from "./slices/supportticket";
import pagesSlice from "./slices/pages";
import shippingSlice from "./slices/shippingSlice";
import customersReducer from "./slices/customersSlice";
import staffSlice from "./slices/staff";
import Content from "./slices/contentSlice";
import Email from "./slices/emailTemplate";
import faqReducer from "./slices/faq";
import reviewSlice from "./slices/reviewSlice";
import brandSlice from "./slices/brandSlice";
import shippingZoneReducer from "./slices/shippingZone";
import calllogReducer from "./slices/calllog";
import structureSlice from "./slices/structure";
import orderReducer from "./slices/Orders";
import contactReducer from "./slices/contactSlice";

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
    attributes: attributeSlice,
    variant: variantSlice,
    product: productSlice,
    plan: plan,
    pages: pagesSlice,
    template: templateSlice,
    coupon: couponSlice,
    blog: blogSlice,
    lead: leadSlice,
    tickets: supportTicketSlice,
    shipping: shippingSlice,
    customers: customersReducer,
    staff: staffSlice,
    content: Content,
    emailTemplates: Email,
    faq: faqReducer,
    review: reviewSlice,
    brand: brandSlice,
    shippingZone: shippingZoneReducer,
    calllog: calllogReducer,
    structure: structureSlice,
    orders: orderReducer,
    contact: contactReducer,
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
