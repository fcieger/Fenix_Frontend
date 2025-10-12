"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

  useEffect(() => {
    // Marcar que estamos no cliente
    setIsClient(true)
    
    // Verificar se há token salvo no localStorage
    const savedToken = localStorage.getItem('fenix_token')
    console.log('🔍 Token salvo no localStorage:', savedToken ? savedToken.substring(0, 20) + '...' : 'Nenhum');
    
    if (savedToken) {
      setToken(savedToken)
      // Buscar dados do usuário
      loadUserProfile(savedToken)
    } else {
      console.log('❌ Nenhum token encontrado, definindo loading como false');
      setIsLoading(false)
    }
  }, [])

  const loadUserProfile = async (userToken: string) => {
    try {
      console.log('🔍 Carregando perfil do usuário com token:', userToken.substring(0, 20) + '...');
      const userData = await apiService.getProfile(userToken)
      console.log('✅ Perfil carregado com sucesso:', userData);
      setUser(userData)
      // Definir primeira empresa como ativa se existir
      if (userData.companies && userData.companies.length > 0) {
        setActiveCompanyId(userData.companies[0].id)
        console.log('🏢 Empresa ativa definida:', userData.companies[0].id);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error)
      // Token inválido, limpar dados
      localStorage.removeItem('fenix_token')
      setToken(null)
      setActiveCompanyId(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await apiService.login({ email, password })
      
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
    isLoading: isLoading || !isClient,
    activeCompanyId,
    login,
    register,
    logout,
    setActiveCompany,
    isAuthenticated: !!user && !!token && isClient,
  }

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
