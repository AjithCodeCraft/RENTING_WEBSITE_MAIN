import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // Replace with your API base URL
  timeout: 1000,
  headers: { 'Content-Type': 'application/json' }
});


// Add a request interceptor
axiosInstance.interceptors.request.use(
  function (config) {
    // Do something before the request is sent
    // For example, add an authentication token to the headers
    const token = localStorage.getItem('authToken'); // Retrieve auth token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // Handle the error
    return Promise.reject(error);
  }
);

export default axiosInstance;