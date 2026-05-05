import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  generatedQuestion: '',
  isGenerating: false,
  statusMessage: '',
  error: null,
  subjects: [],
  isMockTestMode: false,
  timer: 10800,
  studentAnswers: '',
  isEvaluating: false,
  evaluationResult: ''
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startGeneration: (state, action) => {
      state.isGenerating = true;
      state.generatedQuestion = '';
      state.statusMessage = 'Initializing request...';
      state.error = null;
      state.isMockTestMode = action.payload || false;
      state.timer = 10800;
      state.studentAnswers = '';
      state.evaluationResult = '';
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
      state.isEvaluating = false;
      state.statusMessage = '';
      state.error = action.payload;
    },
    resetGeneration: (state) => {
      state.generatedQuestion = '';
      state.isGenerating = false;
      state.statusMessage = '';
      state.error = null;
      state.isMockTestMode = false;
      state.studentAnswers = '';
      state.evaluationResult = '';
    },
    setSubjects: (state, action) => {
      state.subjects = action.payload;
    },
    updateTimer: (state) => {
      if (state.timer > 0) state.timer -= 1;
    },
    setStudentAnswers: (state, action) => {
      state.studentAnswers = action.payload;
    },
    startEvaluation: (state) => {
      state.isEvaluating = true;
      state.evaluationResult = '';
      state.statusMessage = 'Submitting answers for evaluation...';
      state.error = null;
    },
    receiveEvaluationChunk: (state, action) => {
      state.statusMessage = '';
      state.evaluationResult += action.payload;
    },
    evaluationComplete: (state) => {
      state.isEvaluating = false;
      state.statusMessage = '';
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
  setSubjects,
  updateTimer,
  setStudentAnswers,
  startEvaluation,
  receiveEvaluationChunk,
  evaluationComplete
} = chatSlice.actions;

export default chatSlice.reducer;