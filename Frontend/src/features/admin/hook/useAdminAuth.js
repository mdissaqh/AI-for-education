import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import adminService from '../service/adminService';
import { adminAuthStart, adminAuthSuccess, adminAuthFailure, adminLogout } from '../state/adminSlice';

export const useAdminAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminToken, isAdminAuthenticated, loading, error } = useSelector((state) => state.admin);

  const handleAdminLogin = async (email, password) => {
    try {
      dispatch(adminAuthStart());
      const data = await adminService.loginAdmin({ email, password });
      localStorage.setItem('adminToken', data.token);
      dispatch(adminAuthSuccess(data.token));
      navigate('/admin/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Admin login failed';
      dispatch(adminAuthFailure(message));
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  return {
    adminToken,
    isAdminAuthenticated,
    loading,
    error,
    handleAdminLogin,
    handleAdminLogout,
  };
};