import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import authService from '../service/authService';
import { authStart, authSuccess, authFailure, logout } from '../state/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (email, password) => {
    try {
      dispatch(authStart());
      const data = await authService.login({ email, password });
      localStorage.setItem('token', data.token);
      dispatch(authSuccess(data.token));
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      dispatch(authFailure(message));
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      dispatch(authStart());
      const data = await authService.register({ name, email, password });
      localStorage.setItem('token', data.token);
      dispatch(authSuccess(data.token));
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      dispatch(authFailure(message));
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/login');
  };

  return {
    token,
    isAuthenticated,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleGoogleLogin,
    handleLogout,
  };
};