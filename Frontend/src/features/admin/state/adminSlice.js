import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  adminToken: localStorage.getItem('adminToken') || null,
  isAdminAuthenticated: !!localStorage.getItem('adminToken'),
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    adminAuthStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    adminAuthSuccess: (state, action) => {
      state.loading = false;
      state.isAdminAuthenticated = true;
      state.adminToken = action.payload;
      state.error = null;
    },
    adminAuthFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    adminLogout: (state) => {
      state.adminToken = null;
      state.isAdminAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { adminAuthStart, adminAuthSuccess, adminAuthFailure, adminLogout } = adminSlice.actions;
export default adminSlice.reducer;