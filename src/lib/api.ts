import axios from 'axios';

const api = axios.create({
  baseURL: "https://cardiff-school-web.onrender.com",
  timeout: 30000, // 30 second timeout
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('AUTHENTICATION_ERROR: Your session may have expired. Please sign in again.');
    } else if (error.response?.status === 500) {
      console.error('SERVER_ERROR: The backend encountered an unexpected condition.');
    } else {
      console.error('API_ERROR:', error.message || 'An unknown network error occurred.');
    }
    return Promise.reject(error);
  }
);

export default api;
