'use client';

import React, { useState, useEffect } from 'react';
import { ContaContabil } from '@/types/conta-contabil';

interface ContasContabeisDataProps {
  companyId: string;
  children: (data: {
    contas: ContaContabil[];
    loading: boolean;
    error: string | null;
    refreshContas: () => Promise<void>;
  }) => React.ReactNode;
}

export function ContasContabeisData({ companyId, children }: ContasContabeisDataProps) {
  const [contas, setContas] = useState<ContaContabil[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContas = async () => {
    try {
      console.log('ContasContabeisData - Iniciando fetchContas para companyId:', companyId);
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/contas-contabeis?company_id=${companyId}`);
      console.log('ContasContabeisData - Response status:', response.status);
      const data = await response.json();
      console.log('ContasContabeisData - Data recebida:', data);
      
      if (response.ok) {
        console.log('ContasContabeisData - Definindo contas:', data.data);
        setContas(data.data || []);
      } else {
        throw new Error(data.error || 'Erro ao buscar contas contábeis');
      }
    } catch (err) {
      console.error('ContasContabeisData - Erro:', err);
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

  return <>{children({ contas, loading, error, refreshContas: fetchContas })}</>;
}

