import { useState, useEffect, useMemo } from 'react';

interface Movimentacao {
  id: string;
  conta_id: string;
  descricao: string;
  descricao_detalhada?: string;
  valor_entrada: number;
  valor_saida: number;
  data_movimentacao: string;
  situacao: 'pendente' | 'pago' | 'transferido' | 'cancelado';
  saldo_apos_movimentacao: number;
  created_at: string;
  updated_at: string;
}

interface ResumoPeriodo {
  receitas_aberto: number;
  receitas_realizadas: number;
  despesas_aberto: number;
  despesas_realizadas: number;
  total_periodo: number;
}

interface CreateMovimentacaoRequest {
  conta_id: string;
  descricao: string;
  descricao_detalhada?: string;
  valor_entrada?: number;
  valor_saida?: number;
  data_movimentacao: string;
  situacao?: 'pendente' | 'pago' | 'transferido' | 'cancelado';
  created_by: string;
}

interface MovimentacoesFilters {
  periodo?: string; // formato YYYY-MM
  data_inicio?: string; // formato YYYY-MM-DD
  data_fim?: string; // formato YYYY-MM-DD
  search?: string;
  // Filtros avançados
  tipo_movimentacao?: string; // valores separados por vírgula
  valor_min?: number;
  valor_max?: number;
  situacao?: string; // valores separados por vírgula
}

export function useMovimentacoes(contaId: string, filters?: MovimentacoesFilters) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [resumo, setResumo] = useState<ResumoPeriodo>({
    receitas_aberto: 0,
    receitas_realizadas: 0,
    despesas_aberto: 0,
    despesas_realizadas: 0,
    total_periodo: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoizar os filtros para evitar re-renderizações desnecessárias
  const memoizedFilters = useMemo(() => filters, [
    filters?.periodo,
    filters?.data_inicio,
    filters?.data_fim,
    filters?.search,
    filters?.tipo_movimentacao,
    filters?.valor_min,
    filters?.valor_max,
    filters?.situacao
  ]);

  const fetchMovimentacoes = async () => {
    if (!contaId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Construir URL com filtros
      const params = new URLSearchParams();
      if (memoizedFilters?.periodo) {
        params.append('periodo', memoizedFilters.periodo);
      }
      if (memoizedFilters?.data_inicio) {
        params.append('data_inicio', memoizedFilters.data_inicio);
      }
      if (memoizedFilters?.data_fim) {
        params.append('data_fim', memoizedFilters.data_fim);
      }
      if (memoizedFilters?.search) {
        params.append('search', memoizedFilters.search);
      }
      if (memoizedFilters?.tipo_movimentacao) {
        params.append('tipo_movimentacao', memoizedFilters.tipo_movimentacao);
      }
      if (memoizedFilters?.valor_min !== undefined) {
        params.append('valor_min', memoizedFilters.valor_min.toString());
      }
      if (memoizedFilters?.valor_max !== undefined) {
        params.append('valor_max', memoizedFilters.valor_max.toString());
      }
      if (memoizedFilters?.situacao) {
        params.append('situacao', memoizedFilters.situacao);
      }
      
      const url = `/api/contas/${contaId}/movimentacoes${params.toString() ? '?' + params.toString() : ''}`;
      console.log('🔍 Buscando movimentações para conta:', contaId, 'com filtros:', memoizedFilters);
      
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('📊 Resultado da API:', result);
      
      if (result.success) {
        // Converter valores string para number
        const movimentacoesFormatadas = (result.data || []).map((mov: any) => ({
          ...mov,
          valor_entrada: parseFloat(mov.valor_entrada) || 0,
          valor_saida: parseFloat(mov.valor_saida) || 0,
          saldo_apos_movimentacao: parseFloat(mov.saldo_apos_movimentacao) || 0
        }));
        
        setMovimentacoes(movimentacoesFormatadas);
        console.log('✅ Movimentações carregadas:', movimentacoesFormatadas.length);
        console.log('📋 Primeira movimentação:', movimentacoesFormatadas[0]);
      } else {
        throw new Error(result.error || 'Erro ao carregar movimentações');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao carregar movimentações:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumo = async () => {
    if (!contaId) return;
    
    try {
      const response = await fetch(`/api/contas/${contaId}/resumo`);
      const result = await response.json();
      
      if (result.success) {
        const resumoFormatado = {
          receitas_aberto: parseFloat(result.data?.receitas_aberto) || 0,
          receitas_realizadas: parseFloat(result.data?.receitas_realizadas) || 0,
          despesas_aberto: parseFloat(result.data?.despesas_aberto) || 0,
          despesas_realizadas: parseFloat(result.data?.despesas_realizadas) || 0,
          total_periodo: parseFloat(result.data?.total_periodo) || 0
        };
        
        setResumo(resumoFormatado);
        console.log('📊 Resumo carregado:', resumoFormatado);
      }
    } catch (err) {
      console.error('Erro ao carregar resumo:', err);
    }
  };

  const createMovimentacao = async (data: CreateMovimentacaoRequest): Promise<Movimentacao> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/movimentacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Recarregar dados
        await fetchMovimentacoes();
        await fetchResumo();
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao criar movimentação');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateMovimentacao = async (id: string, data: Partial<Movimentacao>): Promise<Movimentacao> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/movimentacoes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMovimentacoes(prev => prev.map(mov => 
          mov.id === id ? result.data : mov
        ));
        await fetchResumo();
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao atualizar movimentação');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteMovimentacao = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/movimentacoes/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMovimentacoes(prev => prev.filter(mov => mov.id !== id));
        await fetchResumo();
        return true;
      } else {
        throw new Error(result.error || 'Erro ao excluir movimentação');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshMovimentacoes = async () => {
    await Promise.all([fetchMovimentacoes(), fetchResumo()]);
  };

  useEffect(() => {
    if (contaId) {
      refreshMovimentacoes();
    }
  }, [contaId, memoizedFilters]);

  return {
    movimentacoes,
    resumo,
    loading,
    error,
    createMovimentacao,
    updateMovimentacao,
    deleteMovimentacao,
    refreshMovimentacoes
  };
}