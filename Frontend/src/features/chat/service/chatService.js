import api from '../../../utils/api';

const fetchFilteredSubjects = async (schemeNo, department, semester) => {
  const params = new URLSearchParams();
  if (schemeNo) params.append('schemeNo', schemeNo);
  if (department) params.append('department', department);
  if (semester) params.append('semester', semester);
  
  const response = await api.get(`/subjects?${params.toString()}`);
  return response.data;
};

const chatService = {
  fetchFilteredSubjects
};

export default chatService;