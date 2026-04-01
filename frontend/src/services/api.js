import axios from 'axios';

const api = axios.create({
    baseURL: 'http://51.20.42.220:8000/api/analyze',
});


export const processVideo = (formData, onProgress) => {
    return api.post('/upload', formData, {
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
    return api.post('/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    });
};

export const getHistory = () => api.get('/history');

export const getStatus = (jobId) => api.get(`/status/${jobId}`);

export default api;
