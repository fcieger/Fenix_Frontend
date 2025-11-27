import { useState, useEffect, useMemo } from 'react';
import {
  listMovements,
  getMovementSummary,
  createMovement,
  updateMovement,
  deleteMovement,
} from '@/services/movements-service';

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
  periodo?: string;
  data_inicio?: string;
  data_fim?: string;
  search?: string;
  tipo_movimentacao?: string;
  valor_min?: number;
  valor_max?: number;
  situacao?: string;
}

export function useMovements(contaId: string, filters?: MovimentacoesFilters) {
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
      const response = await listMovements({
        conta_id: contaId,
        ...memoizedFilters,
      });

      const movimentacoesFormatadas = (response.data || []).map((mov: any) => ({
        ...mov,
        valor_entrada: parseFloat(mov.valor_entrada) || 0,
        valor_saida: parseFloat(mov.valor_saida) || 0,
        saldo_apos_movimentacao: parseFloat(mov.saldo_apos_movimentacao) || 0
      }));

      setMovimentacoes(movimentacoesFormatadas);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading movements';
      setError(errorMessage);
      console.error('❌ Error loading movements:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumo = async () => {
    if (!contaId) return;

    try {
      const summary = await getMovementSummary({ conta_id: contaId });
      setResumo({
        receitas_aberto: parseFloat(summary?.receitas_aberto) || 0,
        receitas_realizadas: parseFloat(summary?.receitas_realizadas) || 0,
        despesas_aberto: parseFloat(summary?.despesas_aberto) || 0,
        despesas_realizadas: parseFloat(summary?.despesas_realizadas) || 0,
        total_periodo: parseFloat(summary?.total_periodo) || 0
      });
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  };

  const createMovimentacao = async (data: CreateMovimentacaoRequest): Promise<Movimentacao> => {
    setLoading(true);
    setError(null);

    try {
      const movement = await createMovement(data);
      await fetchMovimentacoes();
      await fetchResumo();
      return movement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating movement';
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
      const movement = await updateMovement(id, data);
      setMovimentacoes(prev => prev.map(mov =>
        mov.id === id ? movement : mov
      ));
      await fetchResumo();
      return movement;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating movement';
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
      await deleteMovement(id);
      setMovimentacoes(prev => prev.filter(mov => mov.id !== id));
      await fetchResumo();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting movement';
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

// Legacy export for backward compatibility
export { useMovements as useMovimentacoes };


