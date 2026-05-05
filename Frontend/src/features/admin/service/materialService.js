import api from '../../../utils/api';

const uploadMaterial = async (formData) => {
  const response = await api.post('/materials/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const fetchSubjects = async (semester, department, schemeNo) => {
  const params = new URLSearchParams();
  if (semester) params.append('semester', semester);
  if (department) params.append('department', department);
  if (schemeNo) params.append('schemeNo', schemeNo);
  
  const response = await api.get(`/subjects?${params.toString()}`);
  return response.data;
};

const materialService = {
  uploadMaterial,
  fetchSubjects
};

export default materialService;