import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxied by Vite in dev
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for Sanctum CSRF cookies
});

// Request interceptor to add the Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (like 401)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and optionally redirect
      localStorage.removeItem('token');
      // If we're not already on the login page, we could redirect here, 
      // but it's often better handled in the AuthContext or ProtectedRoute.
    }
    return Promise.reject(error);
  }
);

export default api;
