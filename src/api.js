// src/api.js
import axios from 'axios';

const isDevelopment = process.env.NODE_ENV === 'development';

const apiClient = axios.create({
  // Usa la URL de producción o desarrollo según el entorno
  baseURL: isDevelopment 
    ? 'http://127.0.0.1:8000/api/'
    : 'https://thebadgersadmin.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpiar el localStorage
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      
      // Redirigir al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export function apiFetch(url, options = {}) {
  const token = localStorage.getItem('access');
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': token ? `Bearer ${token}` : undefined,
    },
  }).then(response => {
    if (response.status === 401) {
      // Limpiar el localStorage
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      
      // Redirigir al login
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    return response;
  });
}