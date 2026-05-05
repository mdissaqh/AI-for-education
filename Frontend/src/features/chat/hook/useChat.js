import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import chatService from '../service/chatService';
import { 
  startGeneration, 
  updateStatus,
  receiveChunk, 
  generationComplete, 
  generationError,
  setSubjects,
  updateTimer,
  setStudentAnswer,
  startEvaluation,
  receiveEvaluationChunk,
  evaluationComplete
} from '../state/chatSlice';

export const useChat = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  
  const { generatedQuestion, isGenerating, statusMessage, error, subjects, isMockTestMode, timer, studentAnswers, isEvaluating, evaluationResult } = useSelector((state) => state.chat);

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('question_status', (msg) => dispatch(updateStatus(msg)));
    socketRef.current.on('question_chunk', (chunk) => dispatch(receiveChunk(chunk)));
    socketRef.current.on('question_complete', () => dispatch(generationComplete()));
    socketRef.current.on('question_error', (err) => dispatch(generationError(err)));

    socketRef.current.on('evaluation_status', (msg) => dispatch(updateStatus(msg)));
    socketRef.current.on('evaluation_chunk', (chunk) => dispatch(receiveEvaluationChunk(chunk)));
    socketRef.current.on('evaluation_complete', () => dispatch(evaluationComplete()));
    socketRef.current.on('evaluation_error', (err) => dispatch(generationError(err)));

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
    let interval = null;
    if (isMockTestMode && !isGenerating && timer > 0 && !isEvaluating && !evaluationResult) {
      interval = setInterval(() => {
        dispatch(updateTimer());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMockTestMode, isGenerating, timer, isEvaluating, evaluationResult, dispatch]);

  const loadSubjects = async (schemeNo, department, semester) => {
    try {
      const data = await chatService.fetchFilteredSubjects(schemeNo, department, semester);
      dispatch(setSubjects(data));
    } catch (err) {
      dispatch(generationError('Failed to load subjects.'));
      console.error(err);
    }
  };

  const generatePyqQuestion = (subjectId, totalMarks) => {
    if (totalMarks < 45 || totalMarks > 90) {
      dispatch(generationError('Marks must be between 45 and 90.'));
      return;
    }
    dispatch(startGeneration(false));
    socketRef.current.emit('generate_question', { subjectId, totalMarks: parseInt(totalMarks), isMockTest: false });
  };

  const triggerMockTest = (subjectId) => {
    if (!subjectId) {
      dispatch(generationError('Please select a subject first.'));
      return;
    }
    dispatch(startGeneration(true));
    socketRef.current.emit('generate_question', { subjectId, totalMarks: 100, isMockTest: true });
  };

  const handleAnswerChange = (id, text) => {
    dispatch(setStudentAnswer({ id, text }));
  };

  const submitTest = (subjectId, parsedQuestions) => {
    const compiledAnswers = parsedQuestions.map(q => 
      `Question: ${q.text}\nStudent Answer: ${studentAnswers[q.id] || "No answer provided."}`
    ).join("\n\n---\n\n");

    dispatch(startEvaluation());
    socketRef.current.emit('evaluate_test', { subjectId, compiledAnswers });
  };

  const formatTime = () => {
    const h = Math.floor(timer / 3600);
    const m = Math.floor((timer % 3600) / 60);
    const s = timer % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return { generatedQuestion, isGenerating, statusMessage, error, subjects, loadSubjects, generatePyqQuestion, isMockTestMode, formatTime, triggerMockTest, studentAnswers, handleAnswerChange, submitTest, isEvaluating, evaluationResult };
};