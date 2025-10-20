"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { apiService, AuthResponse } from '@/lib/api'

interface AuthContextType {
  user: AuthResponse['user'] | null
  token: string | null
  isLoading: boolean
  activeCompanyId: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: any, companyData: any) => Promise<void>
  logout: () => void
  setActiveCompany: (companyId: string) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  const loadUserProfile = useCallback(async (userToken: string) => {
    try {
      // console.log('🔍 Carregando perfil do usuário com token:', userToken.substring(0, 20) + '...');
      
      const userData = await apiService.getProfile(userToken);
      
      // console.log('✅ Perfil carregado com sucesso:', userData);
      // console.log('🏢 Companies do usuário:', userData.companies);
      setUser(userData)
      // Definir primeira empresa como ativa se existir
      if (userData.companies && userData.companies.length > 0) {
        setActiveCompanyId(userData.companies[0].id)
        // console.log('🏢 Empresa ativa definida:', userData.companies[0].id);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error)
      // Token inválido, limpar dados
      localStorage.removeItem('fenix_token')
      setToken(null)
      setUser(null)
      setActiveCompanyId(null)
    } finally {
      // console.log('🏁 Finalizando carregamento do perfil');
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      console.log('🔄 Iniciando login para:', email);
      const response = await apiService.login({ email, password })
      console.log('✅ Resposta do login:', response);
      
      setUser(response.user)
      setToken(response.access_token)
      localStorage.setItem('fenix_token', response.access_token)
      console.log('🔑 Token salvo no localStorage');
      
      // Definir primeira empresa como ativa se existir
      if (response.user.companies && response.user.companies.length > 0) {
        setActiveCompanyId(response.user.companies[0].id)
        console.log('🏢 Empresa ativa definida:', response.user.companies[0].id);
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // console.log('🚀 useEffect executado');
    
    // Verificar se estamos no cliente
    if (typeof window === 'undefined') {
      // console.log('❌ Executando no servidor, saindo...');
      setIsLoading(false);
      return;
    }
    
    // console.log('✅ Executando no cliente');
    
    // Marcar que estamos no cliente
    setIsClient(true)
    
    // Verificar se há token salvo no localStorage
    const savedToken = localStorage.getItem('fenix_token')
    // console.log('🔍 Token salvo no localStorage:', savedToken ? savedToken.substring(0, 20) + '...' : 'Nenhum');
    
    if (savedToken) {
      // console.log('✅ Token encontrado, carregando perfil...');
      setToken(savedToken)
      // Buscar dados do usuário
      loadUserProfile(savedToken)
    } else {
      // console.log('❌ Nenhum token encontrado, definindo loading como false');
      setIsLoading(false)
    }
  }, [loadUserProfile])

  const register = async (userData: any, companyData: any) => {
    try {
      setIsLoading(true)
      const response = await apiService.register({ user: userData, company: companyData })
      
      setUser(response.user)
      setToken(response.access_token)
      localStorage.setItem('fenix_token', response.access_token)
      
      // Definir primeira empresa como ativa se existir
      if (response.user.companies && response.user.companies.length > 0) {
        setActiveCompanyId(response.user.companies[0].id)
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setActiveCompanyId(null)
    localStorage.removeItem('fenix_token')
  }

  const setActiveCompany = (companyId: string) => {
    setActiveCompanyId(companyId)
  }

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
  }

  // Debug logs (apenas quando estado muda)
  useEffect(() => {
    console.log('🔍 AuthContext State:', {
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
      token: token ? token.substring(0, 20) + '...' : null,
      isLoading,
      isAuthenticated: !!user && !!token,
      activeCompanyId
    });
  }, [user, token, isLoading, activeCompanyId]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
