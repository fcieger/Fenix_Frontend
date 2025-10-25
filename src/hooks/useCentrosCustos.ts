import { useState, useEffect, useCallback } from 'react';
import { CentroCusto, CreateCentroCustoRequest, UpdateCentroCustoRequest, CentroCustoFilters, CentroCustoStats } from '@/types/centro-custo';

interface UseCentrosCustosReturn {
  centros: CentroCusto[];
  stats: CentroCustoStats | null;
  loading: boolean;
  error: string | null;
  createCentro: (data: CreateCentroCustoRequest) => Promise<CentroCusto>;
  updateCentro: (id: string, data: UpdateCentroCustoRequest) => Promise<CentroCusto>;
  deleteCentro: (id: string) => Promise<{ success: boolean; action: 'deleted' | 'inactivated'; message: string }>;
  refreshCentros: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export function useCentrosCustos(filters: CentroCustoFilters = {}): UseCentrosCustosReturn {
  const [centros, setCentros] = useState<CentroCusto[]>([]);
  const [stats, setStats] = useState<CentroCustoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCentros = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      
      if (filters.company_id) queryParams.append('company_id', filters.company_id);
      if (filters.centro_pai_id !== undefined) {
        queryParams.append('centro_pai_id', filters.centro_pai_id === null ? 'null' : filters.centro_pai_id);
      }
      if (filters.ativo !== undefined) queryParams.append('ativo', filters.ativo.toString());
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/centros-custos?${queryParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        setCentros(result.data);
      } else {
        setError(result.error || 'Erro ao carregar centros de custos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar centros de custos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.company_id) queryParams.append('company_id', filters.company_id);

      const response = await fetch(`/api/centros-custos/stats?${queryParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, [filters.company_id]);

  const createCentro = useCallback(async (data: CreateCentroCustoRequest): Promise<CentroCusto> => {
    try {
      setError(null);

      const response = await fetch('/api/centros-custos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Atualizar lista local
        setCentros(prev => [...prev, result.data]);
        // Atualizar stats
        await refreshStats();
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao criar centro de custo');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar centro de custo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateCentro = useCallback(async (id: string, data: UpdateCentroCustoRequest): Promise<CentroCusto> => {
    try {
      setError(null);

      const response = await fetch(`/api/centros-custos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Atualizar lista local
        setCentros(prev => prev.map(centro => 
          centro.id === id ? result.data : centro
        ));
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao atualizar centro de custo');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar centro de custo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteCentro = useCallback(async (id: string): Promise<{ success: boolean; action: 'deleted' | 'inactivated'; message: string }> => {
    try {
      setError(null);

      const response = await fetch(`/api/centros-custos/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Atualizar lista local baseado na ação
        if (result.data.action === 'deleted') {
          setCentros(prev => prev.filter(centro => centro.id !== id));
        } else if (result.data.action === 'inactivated') {
          setCentros(prev => prev.map(centro => 
            centro.id === id ? { ...centro, ativo: false } : centro
          ));
        }
        
        // Atualizar stats
        await refreshStats();
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao excluir centro de custo');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir centro de custo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refreshCentros = useCallback(async () => {
    await fetchCentros();
  }, [fetchCentros]);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchCentros();
    fetchStats();
  }, [filters.company_id, filters.centro_pai_id, filters.ativo, filters.search]);

  return {
    centros,
    stats,
    loading,
    error,
    createCentro,
    updateCentro,
    deleteCentro,
    refreshCentros,
    refreshStats
  };
}
