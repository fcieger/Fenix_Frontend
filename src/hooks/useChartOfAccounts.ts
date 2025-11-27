'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChartOfAccount, CreateChartOfAccountRequest, UpdateChartOfAccountRequest, ChartOfAccountStats } from '@/types/chart-of-account';
import type { ContaContabil, CreateContaContabilRequest, UpdateContaContabilRequest, ContaContabilStats } from '@/types/conta-contabil';
import {
  listChartOfAccounts,
  getChartOfAccountsStats,
  createChartOfAccount,
  updateChartOfAccount,
  deleteChartOfAccount,
} from '@/services/chart-of-accounts-service';

export function useChartOfAccounts(companyId: string) {
  const [contas, setContas] = useState<ChartOfAccount[]>([]);
  const [stats, setStats] = useState<ChartOfAccountStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await listChartOfAccounts({ company_id: companyId });
      setContas(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching chart of accounts');
      console.error('Error fetching chart of accounts:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getChartOfAccountsStats(companyId);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [companyId]);

  const createConta = async (data: CreateChartOfAccountRequest) => {
    try {
      setLoading(true);
      setError(null);

      const account = await createChartOfAccount(data);
      await fetchContas();
      await fetchStats();
      return account;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateConta = async (id: string, data: UpdateChartOfAccountRequest) => {
    try {
      setLoading(true);
      setError(null);

      const account = await updateChartOfAccount(id, data);
      await fetchContas();
      await fetchStats();
      return account;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteConta = async (id: string, ativo: boolean) => {
    try {
      setLoading(true);
      setError(null);

      await deleteChartOfAccount(id);
      await fetchContas();
      await fetchStats();
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshContas = async () => {
    await fetchContas();
  };

  const refreshStats = async () => {
    await fetchStats();
  };

  useEffect(() => {
    if (companyId) {
      fetchContas();
      fetchStats();
    }
  }, [companyId, fetchContas, fetchStats]);

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

// Legacy export for backward compatibility
export { useChartOfAccounts as useContasContabeis };

