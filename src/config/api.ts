import axios, { AxiosRequestConfig } from "axios";

/**
 * Axios instance configurada para uso em toda a aplicação
 * Suporta cancelamento de requisições via AbortController
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000, // 10 segundos
  withCredentials: true, // Habilitar cookies cross-domain
  validateStatus: (status) => {
    // Aceitar até 4xx como resposta válida (para tratamento de erros)
    return status >= 200 && status < 500;
  },
});

// Interceptor para adicionar o token de autenticação automaticamente
api.interceptors.request.use(
  (config) => {
    // Pegar o token do localStorage (apenas no browser)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("fenix_token");
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

// Interceptor para tratar erros de autenticação e timeout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento específico para timeout
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      console.error("Request timeout");
      // Aqui você pode adicionar notificação ao usuário ou retry automático
    }

    // Se receber 401, redirecionar para login
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      // Não redirecionar se já estiver na página de login
      if (currentPath !== "/auth/login" && currentPath !== "/auth/register") {
        localStorage.removeItem("fenix_token");
        localStorage.removeItem("fenix_user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Cria um AbortController para cancelar requisições
 * Útil para cancelar requisições quando o componente é desmontado
 *
 * @example
 * ```typescript
 * const controller = createAbortController();
 * api.get('/endpoint', { signal: controller.signal });
 * // Para cancelar: controller.abort();
 * ```
 */
export function createAbortController(): AbortController {
  return new AbortController();
}

/**
 * API Configuration
 * Base URL for SDK clients and legacy API calls
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  TIMEOUT: 10000, // 10 segundos
} as const;

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return API_CONFIG.BASE_URL;
}

/**
 * Get token from localStorage (client-side only)
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fenix_token");
}
