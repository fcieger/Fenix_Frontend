import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/lib/api';

interface NFeIntegrationStatus {
  status: string;
  chaveAcesso?: string;
  dataAutorizacao?: string;
  protocoloAutorizacao?: string;
  ultimaAtualizacao?: string;
}

interface UseNFeIntegrationReturn {
  // Estado
  isEmitindo: boolean;
  isSincronizando: boolean;
  status: string;
  statusInfo: NFeIntegrationStatus | null;
  error: string | null;
  
  // Ações
  emitirNFe: () => Promise<void>;
  sincronizarStatus: () => Promise<void>;
  clearError: () => void;
  
  // Utilitários
  getStatusColor: (status: string) => string;
  canEmitir: boolean;
  canSincronizar: boolean;
}

export function useNFeIntegration(nfeId: string, initialStatus: string): UseNFeIntegrationReturn {
  const { token } = useAuth();
  const [isEmitindo, setIsEmitindo] = useState(false);
  const [isSincronizando, setIsSincronizando] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [statusInfo, setStatusInfo] = useState<NFeIntegrationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Atualizar status quando prop mudar
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  // Buscar informações detalhadas do status
  useEffect(() => {
    if (status !== 'RASCUNHO') {
      buscarStatusDetalhado();
    }
  }, [status]);

  const buscarStatusDetalhado = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await apiService.getStatusIntegracaoNFe(nfeId, token);
      setStatusInfo(response);
    } catch (error) {
      console.error('Erro ao buscar status detalhado:', error);
    }
  }, [nfeId, token]);

  const emitirNFe = useCallback(async () => {
    if (!token) return;
    
    setIsEmitindo(true);
    setError(null);
    
    try {
      const response = await apiService.emitirNFeExterna(nfeId, token);
      setStatus(response.status);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      setError(errorMessage);
      throw error;
    } finally {
      setIsEmitindo(false);
    }
  }, [nfeId, token]);

  const sincronizarStatus = useCallback(async () => {
    if (!token) return;
    
    setIsSincronizando(true);
    setError(null);
    
    try {
      const response = await apiService.sincronizarNFe(nfeId, token);
      
      if (response.success) {
        await buscarStatusDetalhado();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao sincronizar';
      setError(errorMessage);
      throw error;
    } finally {
      setIsSincronizando(false);
    }
  }, [nfeId, token, buscarStatusDetalhado]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    const statusConfig = {
      RASCUNHO: 'bg-gray-100 text-gray-800',
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      AUTORIZADA: 'bg-green-100 text-green-800',
      REJEITADA: 'bg-red-100 text-red-800',
      CANCELADA: 'bg-red-100 text-red-800'
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  }, []);

  const canEmitir = status === 'RASCUNHO';
  const canSincronizar = status === 'PENDENTE' || status === 'AUTORIZADA';

  return {
    // Estado
    isEmitindo,
    isSincronizando,
    status,
    statusInfo,
    error,
    
    // Ações
    emitirNFe,
    sincronizarStatus,
    clearError,
    
    // Utilitários
    getStatusColor,
    canEmitir,
    canSincronizar
  };
}




