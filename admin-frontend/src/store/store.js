import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import pagesReducer from './slices/pagesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pages: pagesReducer
  }
});
