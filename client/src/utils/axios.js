import axios from 'axios';
import { API_URL } from '../config';

console.log('Initializing axios instance with baseURL:', API_URL); // Initialization check

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request interceptor running for URL:', config.url); // Request check
    const token = localStorage.getItem('token');
    console.log('Token in request interceptor:', token); // Token check
    
    if (token) {
      config.headers['x-auth-token'] = token;
      console.log('Request headers with token:', config.headers);
    } else {
      console.log('No token found in localStorage for request');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error for URL:', error.config?.url);
    console.error('Response error status:', error.response?.status);
    console.error('Response error data:', error.response?.data);
    
    // Only handle 401 errors
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      console.log('401 error - redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 