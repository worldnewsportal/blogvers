// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import categoriesReducer from './slices/categoriesSlice';
import uiReducer from './slices/uiSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    categories: categoriesReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser'],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
