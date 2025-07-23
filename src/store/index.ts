import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice";
import courseCategoryReducer from "./slices/courseCategorySlice";
// import courseReducer from './slices/courseSlice';


import moduleReducer from './slices/moduleSlice'



import filter from "./slices/filter";
import course from "./slices/course";
import lesson from "./slices/lesson";
import module from "./slices/module";
import assignment from "./slices/assignment";
import textLesson from "./slices/textLesson";
import CourseBundle from "./slices/courseBundle";
import quiz from "./slices/quiz";
import file from "./slices/files";
import drip from "./slices/drip";
import vedio from "./slices/vedio";
import anayltics from "./slices/anayltics";

import dashboardReducer from "./slices/dashboard";

import user from "./slices/user";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    //module
    modules: moduleReducer,
    courseCategory: courseCategoryReducer,
    filter: filter,
    course: course,
    lesson: lesson,
    // module: module,
    assignment: assignment,
    textLesson: textLesson,
    courseBundle: CourseBundle,
    quiz: quiz,
    drip: drip,
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
