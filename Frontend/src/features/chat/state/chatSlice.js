import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  generatedQuestion: '',
  isGenerating: false,
  statusMessage: '',
  error: null,
  subjects: []
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startGeneration: (state) => {
      state.isGenerating = true;
      state.generatedQuestion = '';
      state.statusMessage = 'Initializing request...';
      state.error = null;
    },
    updateStatus: (state, action) => {
      state.statusMessage = action.payload;
    },
    receiveChunk: (state, action) => {
      state.statusMessage = ''; 
      state.generatedQuestion += action.payload;
    },
    generationComplete: (state) => {
      state.isGenerating = false;
      state.statusMessage = '';
    },
    generationError: (state, action) => {
      state.isGenerating = false;
      state.statusMessage = '';
      state.error = action.payload;
    },
    resetGeneration: (state) => {
      state.generatedQuestion = '';
      state.isGenerating = false;
      state.statusMessage = '';
      state.error = null;
    },
    setSubjects: (state, action) => {
      state.subjects = action.payload;
    }
  }
});

export const { 
  startGeneration, 
  updateStatus,
  receiveChunk, 
  generationComplete, 
  generationError, 
  resetGeneration, 
  setSubjects 
} = chatSlice.actions;

export default chatSlice.reducer;