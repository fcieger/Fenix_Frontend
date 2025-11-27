import { useState, useEffect } from 'react';
import { FinancialAccount, CreateFinancialAccountRequest } from '@/types/financial-account';
import type { ContaFinanceira, CreateContaFinanceiraRequest } from '@/types/conta';
import {
  listFinancialAccounts,
  createFinancialAccount,
  updateFinancialAccount,
  deleteFinancialAccount,
} from '@/services/financial-accounts-service';

interface UseFinancialAccountsReturn {
  contas: ContaFinanceira[];
  loading: boolean;
  error: string | null;
  createConta: (data: CreateFinancialAccountRequest) => Promise<FinancialAccount>;
  updateConta: (id: string, data: Partial<FinancialAccount>) => Promise<FinancialAccount>;
  deleteConta: (id: string) => Promise<boolean>;
  refreshContas: () => Promise<void>;
}

export function useFinancialAccounts(companyId?: string): UseFinancialAccountsReturn {
  const [contas, setContas] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContas = async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await listFinancialAccounts({ company_id: companyId });
      setContas(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching accounts');
      console.error('❌ Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createConta = async (data: CreateFinancialAccountRequest): Promise<FinancialAccount> => {
    setLoading(true);
    setError(null);

    try {
      const account = await createFinancialAccount(data);
      setContas(prev => [account, ...prev]);
      return account;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating account';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateConta = async (id: string, data: Partial<FinancialAccount>): Promise<FinancialAccount> => {
    setLoading(true);
    setError(null);

    try {
      const account = await updateFinancialAccount(id, data);
      setContas(prev => prev.map(conta =>
        conta.id === id ? account : conta
      ));
      return account;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating account';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteConta = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await deleteFinancialAccount(id);
      setContas(prev => prev.filter(conta => conta.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting account';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshContas = async () => {
    await fetchContas();
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

// Legacy export for backward compatibility
export { useFinancialAccounts as useContas };

