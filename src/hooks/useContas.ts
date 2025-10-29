import { useState, useEffect } from 'react';
import { ContaFinanceira, CreateContaFinanceiraRequest } from '@/types/conta';

interface UseContasReturn {
  contas: ContaFinanceira[];
  loading: boolean;
  error: string | null;
  createConta: (data: CreateContaFinanceiraRequest) => Promise<ContaFinanceira>;
  updateConta: (id: string, data: Partial<ContaFinanceira>) => Promise<ContaFinanceira>;
  deleteConta: (id: string) => Promise<boolean>;
  refreshContas: () => Promise<void>;
}

export function useContas(companyId?: string): UseContasReturn {
  const [contas, setContas] = useState<ContaFinanceira[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContas = async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (companyId) params.append('company_id', companyId);
      
      const response = await fetch(`/api/contas?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setContas(data.data);
      } else {
        throw new Error(data.error || 'Erro ao buscar contas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('❌ Erro ao buscar contas:', err);
    } finally {
      setLoading(false);
    }
  };

  const createConta = async (data: CreateContaFinanceiraRequest): Promise<ContaFinanceira> => {
    console.log('🔍 DEBUG - useContas.createConta chamado com:', data);
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 DEBUG - Enviando requisição para /api/contas');
      const response = await fetch('/api/contas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('🔍 DEBUG - Resposta recebida:', response.status, response.statusText);
      const result = await response.json();
      console.log('🔍 DEBUG - Resultado da API:', result);
      
      if (result.success) {
        console.log('🔍 DEBUG - Conta criada com sucesso, atualizando estado');
        setContas(prev => [result.data, ...prev]);
        return result.data;
      } else {
        console.error('🔍 DEBUG - Erro na API:', result.error);
        throw new Error(result.error || 'Erro ao criar conta');
      }
    } catch (err) {
      console.error('🔍 DEBUG - Erro no createConta:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateConta = async (id: string, data: Partial<ContaFinanceira>): Promise<ContaFinanceira> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/contas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setContas(prev => prev.map(conta => 
          conta.id === id ? result.data : conta
        ));
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao atualizar conta');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteConta = async (id: string): Promise<{ success: boolean; action: 'deleted' | 'inactivated'; message: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/contas/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (result.action === 'deleted') {
          // Remove da lista se foi excluída
          setContas(prev => prev.filter(conta => conta.id !== id));
        } else if (result.action === 'inactivated') {
          // Atualiza o status se foi inativada
          setContas(prev => prev.map(conta => 
            conta.id === id ? { ...conta, status: 'inativo' } : conta
          ));
        }
        return result;
      } else {
        throw new Error(result.error || 'Erro ao excluir conta');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshContas = async () => {
    console.log('🔄 DEBUG - refreshContas chamado');
    await fetchContas();
    console.log('✅ DEBUG - refreshContas concluído');
  };

  useEffect(() => {
    if (companyId) {
      fetchContas();
    }
  }, [companyId]);

  return {
    contas,
    loading,
    error,
    createConta,
    updateConta,
    deleteConta,
    refreshContas,
  };
}
