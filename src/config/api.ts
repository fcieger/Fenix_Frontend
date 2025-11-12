import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000, // 10 segundos
  withCredentials: true, // Habilitar cookies cross-domain
});

// Interceptor para adicionar o token de autenticação automaticamente
api.interceptors.request.use(
  (config) => {
    // Pegar o token do localStorage (apenas no browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fenix_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401, redirecionar para login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      // Não redirecionar se já estiver na página de login
      if (currentPath !== '/auth/login' && currentPath !== '/auth/register') {
        localStorage.removeItem('fenix_token');
        localStorage.removeItem('fenix_user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  TIMEOUT: 10000, // 10 segundos
}
