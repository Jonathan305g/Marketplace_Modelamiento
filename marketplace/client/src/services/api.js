// (Necesitarás instalar axios: npm install axios)
import axios from 'axios';

// Creamos una instancia de axios
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // La URL de tu backend
  withCredentials: true, // Importante si usas cookies
});

// Interceptor para añadir el token a CADA petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Funciones específicas de la API (opcional)
// export const loginRequest = (user) => api.post(`/auth/login`, user);
// export const registerRequest = (user) => api.post(`/auth/register`, user);
// export const getUsersRequest = () => api.get(`/admin/users`);
// ...etc