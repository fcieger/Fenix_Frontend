'use client';

import { useState, useEffect } from 'react';
import { ContaContabil } from '@/types/conta-contabil';

export function useContasContabeisSimples(companyId: string) {
  const [contas, setContas] = useState<ContaContabil[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContas = async () => {
    try {
      console.log('useContasContabeisSimples - Iniciando fetchContas para companyId:', companyId);
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/contas-contabeis?company_id=${companyId}`);
      console.log('useContasContabeisSimples - Response status:', response.status);
      const data = await response.json();
      console.log('useContasContabeisSimples - Data recebida:', data);
      
      if (response.ok) {
        console.log('useContasContabeisSimples - Definindo contas:', data.data);
        setContas(data.data || []);
      } else {
        throw new Error(data.error || 'Erro ao buscar contas contábeis');
      }
    } catch (err) {
      console.error('useContasContabeisSimples - Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
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
    refreshContas: fetchContas,
  };
}

