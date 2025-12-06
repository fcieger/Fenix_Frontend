"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { SdkClientFactory } from "@/lib/sdk/client-factory";
import { SdkErrorHandler } from "@/lib/sdk/error-handler";
import { initializeSdk } from "@/lib/sdk/initialize";
import type { AuthResponse, User } from "@/types/auth";

interface AuthContextType {
  user: AuthResponse["user"] | null;
  token: string | null;
  isLoading: boolean;
  activeCompanyId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any, companyData: any) => Promise<void>;
  logout: () => void;
  setActiveCompany: (companyId: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize SDK on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeSdk();
    }
  }, []);

  const loadUserProfile = useCallback(async (userToken: string) => {
    try {
      const authClient = SdkClientFactory.getAuthClient();
      const userData = await authClient.getProfile(userToken);

      setUser(userData);
      // Set first company as active if exists
      if (userData.companies && userData.companies.length > 0) {
        const companyId = userData.companies[0].id;
        setActiveCompanyId(companyId);
        localStorage.setItem("activeCompanyId", companyId);
      }
    } catch (error: any) {
      console.error("❌ Error loading profile:", error);

      const errorInfo = SdkErrorHandler.handleError(error);

      // If 401 or 404, redirect to cleanup
      if (
        SdkErrorHandler.isAuthError(error) ||
        SdkErrorHandler.isNotFoundError(error)
      ) {
        console.log("🔄 Invalid token detected, redirecting to cleanup...");
        localStorage.removeItem("fenix_token");
        localStorage.removeItem("activeCompanyId");
        setToken(null);
        setUser(null);
        setActiveCompanyId(null);

        // Redirect to cleanup page
        if (typeof window !== "undefined") {
          window.location.href = "/clear-token";
          return;
        }
      }

      // Invalid token, clear data
      localStorage.removeItem("fenix_token");
      localStorage.removeItem("activeCompanyId");
      setToken(null);
      setUser(null);
      setActiveCompanyId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("🔄 Starting login for:", email);

      const authClient = SdkClientFactory.getAuthClient();
      const response = await authClient.login({ email, password });

      console.log("✅ Login response:", response);

      setUser(response.user);
      setToken(response.access_token);
      localStorage.setItem("fenix_token", response.access_token);
      console.log("🔑 Token saved to localStorage");

      // Set first company as active if exists
      if (response.user.companies && response.user.companies.length > 0) {
        const companyId = response.user.companies[0].id;
        setActiveCompanyId(companyId);
        localStorage.setItem("activeCompanyId", companyId);
        console.log("🏢 Active company set:", companyId);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      const errorInfo = SdkErrorHandler.handleError(error);
      throw new Error(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // console.log('🚀 useEffect executado');

    // Verificar se estamos no cliente
    if (typeof window === "undefined") {
      // console.log('❌ Executando no servidor, saindo...');
      setIsLoading(false);
      return;
    }

    // console.log('✅ Executando no cliente');

    // Marcar que estamos no cliente
    setIsClient(true);

    // Verificar se há token salvo no localStorage
    const savedToken = localStorage.getItem("fenix_token");
    // console.log('🔍 Token salvo no localStorage:', savedToken ? savedToken.substring(0, 20) + '...' : 'Nenhum');

    if (savedToken) {
      // console.log('✅ Token encontrado, carregando perfil...');
      setToken(savedToken);
      // Buscar dados do usuário
      loadUserProfile(savedToken);
    } else {
      // console.log('❌ Nenhum token encontrado, definindo loading como false');
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  const register = async (userData: any, companyData: any) => {
    try {
      setIsLoading(true);
      console.log("🔄 Starting registration for:", userData.email);

      const authClient = SdkClientFactory.getAuthClient();
      const response = await authClient.register({
        user: userData,
        company: companyData,
      });

      console.log("✅ Registration response:", response);

      setUser(response.user);
      setToken(response.access_token);
      localStorage.setItem("fenix_token", response.access_token);
      console.log("🔑 Token saved to localStorage");

      // Set first company as active if exists
      if (response.user.companies && response.user.companies.length > 0) {
        const companyId = response.user.companies[0].id;
        setActiveCompanyId(companyId);
        localStorage.setItem("activeCompanyId", companyId);
        console.log("🏢 Active company set:", companyId);
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      const errorInfo = SdkErrorHandler.handleError(error);
      throw new Error(errorInfo.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveCompanyId(null);
    localStorage.removeItem("fenix_token");
    localStorage.removeItem("activeCompanyId");
    // Clear SDK clients on logout
    SdkClientFactory.clearClients();
  };

  const setActiveCompany = (companyId: string) => {
    setActiveCompanyId(companyId);
    localStorage.setItem("activeCompanyId", companyId);
  };

  const value = {
    user,
    token,
    isLoading,
    activeCompanyId,
    login,
    register,
    logout,
    setActiveCompany,
    isAuthenticated: !!user && !!token,
  };

  // Debug logs (apenas quando estado muda)
  useEffect(() => {
    console.log("🔍 AuthContext State:", {
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
      token: token ? token.substring(0, 20) + "..." : null,
      isLoading,
      isAuthenticated: !!user && !!token,
      activeCompanyId,
    });
  }, [user, token, isLoading, activeCompanyId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
