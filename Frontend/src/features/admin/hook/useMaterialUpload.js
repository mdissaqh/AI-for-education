import { useDispatch, useSelector } from 'react-redux';
import materialService from '../service/materialService';
import { uploadStart, uploadSuccess, uploadFailure, resetUploadState } from '../state/materialSlice';

export const useMaterialUpload = () => {
  const dispatch = useDispatch();
  const { uploading, success, error } = useSelector((state) => state.material);

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

  return {
    uploading,
    success,
    error,
    handleUpload,
  };
};