import api from '../../../utils/api';

const uploadMaterial = async (formData) => {
  const response = await api.post('/materials/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const materialService = {
  uploadMaterial,
};

export default materialService;