'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContaContabil, CreateContaContabilRequest, UpdateContaContabilRequest, ContaContabilStats } from '@/types/conta-contabil';

export function useContasContabeis(companyId: string) {
  const [contas, setContas] = useState<ContaContabil[]>([]);
  const [stats, setStats] = useState<ContaContabilStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar contas contábeis
  const fetchContas = useCallback(async () => {
    try {
      console.log('useContasContabeis - Iniciando fetchContas para companyId:', companyId);
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/contas-contabeis?company_id=${companyId}`);
      console.log('useContasContabeis - Response status:', response.status);
      const data = await response.json();
      console.log('useContasContabeis - Data recebida:', data);
      
      if (response.ok) {
        console.log('useContasContabeis - Definindo contas:', data.data);
        setContas(data.data || []);
      } else {
        throw new Error(data.error || 'Erro ao buscar contas contábeis');
      }
    } catch (err) {
      console.error('useContasContabeis - Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/contas-contabeis/stats?company_id=${companyId}`);
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  }, [companyId]);

  // Criar conta contábil
  const createConta = async (data: CreateContaContabilRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/contas-contabeis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await fetchContas();
        await fetchStats();
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao criar conta contábil');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar conta contábil
  const updateConta = async (id: string, data: UpdateContaContabilRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/contas-contabeis/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await fetchContas();
        await fetchStats();
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao atualizar conta contábil');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Excluir/inativar conta contábil
  const deleteConta = async (id: string, ativo: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/contas-contabeis/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: !ativo }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await fetchContas();
        await fetchStats();
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao excluir conta contábil');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar dados
  const refreshContas = async () => {
    await fetchContas();
  };

  const refreshStats = async () => {
    await fetchStats();
  };

  // Carregar dados iniciais
  useEffect(() => {
    console.log('useContasContabeis - useEffect executado, companyId:', companyId);
    if (companyId) {
      console.log('useContasContabeis - Executando fetchContas e fetchStats');
      // Executar diretamente sem useCallback para testar
      const testFetch = async () => {
        try {
          console.log('useContasContabeis - Teste direto iniciado');
          const response = await fetch(`/api/contas-contabeis?company_id=${companyId}`);
          console.log('useContasContabeis - Teste direto response:', response.status);
          const data = await response.json();
          console.log('useContasContabeis - Teste direto data:', data);
          if (response.ok) {
            setContas(data.data || []);
            console.log('useContasContabeis - Teste direto contas definidas:', data.data);
          }
        } catch (err) {
          console.error('useContasContabeis - Teste direto erro:', err);
        }
      };
      testFetch();
      fetchStats();
    }
  }, [companyId]);

  return {
    contas,
    stats,
    loading,
    error,
    createConta,
    updateConta,
    deleteConta,
    refreshContas,
    refreshStats,
  };
}
