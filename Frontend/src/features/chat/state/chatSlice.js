import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  generatedQuestion: '',
  isGenerating: false,
  statusMessage: '',
  error: null,
  subjects: [],
  isMockTestMode: false,
  timer: 10800,
  studentAnswers: {},
  isEvaluating: false,
  evaluationResult: '',
  chatMessages: [],
  isChatLoading: false
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
      state.studentAnswers = {};
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
      state.isChatLoading = false;
      state.statusMessage = '';
      state.error = action.payload;
    },
    setSubjects: (state, action) => {
      state.subjects = action.payload;
    },
    updateTimer: (state) => {
      if (state.timer > 0) state.timer -= 1;
    },
    setStudentAnswer: (state, action) => {
      const { id, text } = action.payload;
      state.studentAnswers[id] = text;
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
    },
    addUserMessage: (state, action) => {
      state.chatMessages.push({ role: 'user', content: action.payload });
      state.chatMessages.push({ role: 'ai', content: '' });
      state.isChatLoading = true;
    },
    receiveChatChunk: (state, action) => {
      const lastIndex = state.chatMessages.length - 1;
      if (state.chatMessages[lastIndex].role === 'ai') {
        state.chatMessages[lastIndex].content += action.payload;
      }
    },
    chatComplete: (state) => {
      state.isChatLoading = false;
    }
  }
});

export const { 
  startGeneration, updateStatus, receiveChunk, generationComplete, 
  generationError, setSubjects, updateTimer, setStudentAnswer, 
  startEvaluation, receiveEvaluationChunk, evaluationComplete, 
  addUserMessage, receiveChatChunk, chatComplete 
} = chatSlice.actions;

export default chatSlice.reducer;