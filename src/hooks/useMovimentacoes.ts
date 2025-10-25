import { useState, useEffect } from 'react';

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

export function useMovimentacoes(contaId: string) {
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

  const fetchMovimentacoes = async () => {
    if (!contaId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Buscando movimentações para conta:', contaId);
      const response = await fetch(`/api/contas/${contaId}/movimentacoes`);
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
  }, [contaId]);

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