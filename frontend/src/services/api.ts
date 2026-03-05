import axios from 'axios';

// 1. Create the Axios instance
const api = axios.create({
  // FIXED: Aligned with the new global /api namespace
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Attaches Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('glucolens_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 3. Response Interceptor: Handles 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('glucolens_token');
      localStorage.removeItem('glucolens_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;