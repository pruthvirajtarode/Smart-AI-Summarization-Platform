import axios from 'axios';

const api = axios.create({
    baseURL: 'http://51.20.42.220:8000/api/v1',
});

export const processVideo = (formData, onProgress) => {
    return api.post('/process/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    });
};

export const processDocument = (formData, onProgress) => {
    return api.post('/process/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    });
};

export const getHistory = () => api.get('/uploads');

export const getStatus = (processId) => api.get(`/status/${processId}`);

export default api;
