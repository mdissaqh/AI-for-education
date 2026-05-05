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
  const timeoutRef = useRef(null);
  
  const { generatedQuestion, isGenerating, statusMessage, error, subjects } = useSelector((state) => state.chat);

  const resetTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      dispatch(generationError('Request timed out. The server took too long to respond.'));
    }, 60000); 
  };

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('connect_error', (err) => {
      dispatch(generationError(`Connection Error: ${err.message}`));
      clearTimeout(timeoutRef.current);
    });

    socketRef.current.on('disconnect', (reason) => {
      if (reason === 'io server disconnect' || reason === 'transport close') {
        dispatch(generationError('Disconnected from the server. Please try again.'));
        clearTimeout(timeoutRef.current);
      }
    });

    socketRef.current.on('question_status', (statusMsg) => {
      resetTimeout(); 
      dispatch(updateStatus(statusMsg));
    });

    socketRef.current.on('question_chunk', (chunk) => {
      resetTimeout();
      dispatch(receiveChunk(chunk));
    });

    socketRef.current.on('question_complete', () => {
      clearTimeout(timeoutRef.current);
      dispatch(generationComplete());
    });

    socketRef.current.on('question_error', (errMsg) => {
      clearTimeout(timeoutRef.current);
      dispatch(generationError(errMsg));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      clearTimeout(timeoutRef.current);
    };
  }, [dispatch]);

  const loadSubjects = async (schemeNo, department, semester) => {
    try {
      if (!schemeNo || !department || !semester) return;
      const data = await chatService.fetchFilteredSubjects(schemeNo, department, semester);
      dispatch(setSubjects(data));
    } catch (err) {
      dispatch(generationError('Failed to load subjects from the database.'));
      console.error('Error fetching subjects:', err);
    }
  };

  const generatePyqQuestion = (subjectId) => {
    dispatch(startGeneration());
    resetTimeout(); 
    socketRef.current.emit('generate_question', { subjectId });
  };

  return { 
    generatedQuestion, 
    isGenerating, 
    statusMessage,
    error, 
    subjects,
    loadSubjects,
    generatePyqQuestion 
  };
};