// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // MUITO IMPORTANTE para enviar cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido - redireciona para login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;