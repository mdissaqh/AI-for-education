import { useDispatch, useSelector } from 'react-redux';
import materialService from '../service/materialService';
import { uploadStart, uploadSuccess, uploadFailure, resetUploadState, setAvailableSubjects } from '../state/materialSlice';

export const useMaterialUpload = () => {
  const dispatch = useDispatch();
  const { uploading, success, error, availableSubjects } = useSelector((state) => state.material);

  const handleUpload = async (formData) => {
    try {
      dispatch(uploadStart());
      await materialService.uploadMaterial(formData);
      dispatch(uploadSuccess());
      setTimeout(() => {
        dispatch(resetUploadState());
      }, 4000);
    } catch (err) {
      const message = err.response?.data?.error || 'Material upload failed';
      dispatch(uploadFailure(message));
    }
  };

  const loadSubjects = async (semester, department, schemeNo) => {
    try {
      const subjects = await materialService.fetchSubjects(semester, department, schemeNo);
      dispatch(setAvailableSubjects(subjects));
    } catch (err) {
      console.error('Failed to load subjects', err);
    }
  };

  return {
    uploading,
    success,
    error,
    availableSubjects,
    handleUpload,
    loadSubjects
  };
};