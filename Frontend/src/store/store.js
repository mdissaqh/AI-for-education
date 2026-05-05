import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/state/authSlice';
import adminReducer from '../features/admin/state/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
  },
});