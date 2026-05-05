import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uploading: false,
  success: false,
  error: null,
  availableSubjects: []
};

const materialSlice = createSlice({
  name: 'material',
  initialState,
  reducers: {
    uploadStart: (state) => {
      state.uploading = true;
      state.success = false;
      state.error = null;
    },
    uploadSuccess: (state) => {
      state.uploading = false;
      state.success = true;
      state.error = null;
    },
    uploadFailure: (state, action) => {
      state.uploading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetUploadState: (state) => {
      state.uploading = false;
      state.success = false;
      state.error = null;
    },
    setAvailableSubjects: (state, action) => {
      state.availableSubjects = action.payload;
    }
  },
});

export const { uploadStart, uploadSuccess, uploadFailure, resetUploadState, setAvailableSubjects } = materialSlice.actions;
export default materialSlice.reducer;