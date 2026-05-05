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
  setSubjects
} from '../state/chatSlice';

export const useChat = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  
  
  const { generatedQuestion, isGenerating, statusMessage, error, subjects } = useSelector((state) => state.chat);

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('question_status', (msg) => dispatch(updateStatus(msg)));
    socketRef.current.on('question_chunk', (chunk) => dispatch(receiveChunk(chunk)));
    socketRef.current.on('question_complete', () => dispatch(generationComplete()));
    socketRef.current.on('question_error', (err) => dispatch(generationError(err)));

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [dispatch]);

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
    dispatch(startGeneration());
    socketRef.current.emit('generate_question', { subjectId, totalMarks: parseInt(totalMarks) });
  };

  return { generatedQuestion, isGenerating, statusMessage, error, subjects, loadSubjects, generatePyqQuestion };
};