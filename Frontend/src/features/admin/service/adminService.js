import api from '../../../utils/api';

const loginAdmin = async (adminData) => {
  const response = await api.post('/admin/login', adminData);
  return response.data;
};

const adminService = {
  loginAdmin,
};

export default adminService;