import { useState, useEffect, useCallback } from 'react';
import { CostCenter, CreateCostCenterRequest, UpdateCostCenterRequest, CostCenterFilters, CostCenterStats } from '@/types/cost-center';
import type { CentroCusto, CreateCentroCustoRequest, UpdateCentroCustoRequest, CentroCustoFilters, CentroCustoStats } from '@/types/centro-custo';
import {
  listCostCenters,
  getCostCentersStats,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
} from '@/services/cost-centers-service';

interface UseCostCentersReturn {
  centros: CentroCusto[];
  stats: CentroCustoStats | null;
  loading: boolean;
  error: string | null;
  createCentro: (data: CreateCostCenterRequest) => Promise<CostCenter>;
  updateCentro: (id: string, data: UpdateCostCenterRequest) => Promise<CostCenter>;
  deleteCentro: (id: string) => Promise<{ success: boolean; action: 'deleted' | 'inactivated'; message: string }>;
  refreshCentros: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export function useCostCenters(filters: CostCenterFilters = {}): UseCostCentersReturn {
  const [centros, setCentros] = useState<CostCenter[]>([]);
  const [stats, setStats] = useState<CostCenterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCentros = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await listCostCenters(filters);
      setCentros(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading cost centers');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getCostCentersStats({ company_id: filters.company_id });
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, [filters.company_id]);

  const createCentro = useCallback(async (data: CreateCostCenterRequest): Promise<CostCenter> => {
    try {
      setError(null);
      const center = await createCostCenter(data);
      setCentros(prev => [...prev, center]);
      await refreshStats();
      return center;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating cost center';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateCentro = useCallback(async (id: string, data: UpdateCostCenterRequest): Promise<CostCenter> => {
    try {
      setError(null);
      const center = await updateCostCenter(id, data);
      setCentros(prev => prev.map(centro =>
        centro.id === id ? center : centro
      ));
      return center;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating cost center';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteCentro = useCallback(async (id: string): Promise<{ success: boolean; action: 'deleted' | 'inactivated'; message: string }> => {
    try {
      setError(null);
      const result = await deleteCostCenter(id);

      if (result.action === 'deleted') {
        setCentros(prev => prev.filter(centro => centro.id !== id));
      } else if (result.action === 'inactivated') {
        setCentros(prev => prev.map(centro =>
          centro.id === id ? { ...centro, ativo: false } : centro
        ));
      }

      await refreshStats();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting cost center';
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

  useEffect(() => {
    fetchCentros();
    fetchStats();
  }, [filters.company_id, filters.centro_pai_id, filters.ativo, filters.search, fetchCentros, fetchStats]);

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

// Legacy export for backward compatibility
export { useCostCenters as useCentrosCustos };

