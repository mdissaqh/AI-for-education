import api from '../../../utils/api';

const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

const authService = {
  login,
  register,
};

export default authService;