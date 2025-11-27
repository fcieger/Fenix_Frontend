import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Chart of Accounts Service
 * Uses Next.js API routes
 *
 * NOTE: This service uses direct API routes because there's no ChartOfAccountsApiClient in the SDK.
 *
 * TODO: Consider adding ChartOfAccountsApiClient to the SDK in the future.
 */

/**
 * List chart of accounts
 */
export async function listChartOfAccounts(params?: {
  company_id?: string;
  [key: string]: any;
}) {
  try {
    // Try SDK first if available
    // Note: SDK may not have ChartOfAccounts client, so fallback to API
    const response = await fetch(`/api/contas-contabeis?company_id=${params?.company_id || ''}`);
    const data = await response.json();

    if (data.success) {
      return { data: data.data, meta: {} };
    }
    throw new Error(data.error || 'Error fetching chart of accounts');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get chart of accounts stats
 */
export async function getChartOfAccountsStats(companyId: string) {
  try {
    const response = await fetch(`/api/contas-contabeis/stats?company_id=${companyId}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error fetching stats');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single chart of account by ID
 */
export async function getChartOfAccount(id: string) {
  try {
    const response = await fetch(`/api/contas-contabeis/${id}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error fetching chart of account');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new chart of account
 */
export async function createChartOfAccount(payload: any) {
  try {
    const response = await fetch('/api/contas-contabeis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error creating chart of account');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update a chart of account
 */
export async function updateChartOfAccount(id: string, payload: Partial<any>) {
  try {
    const response = await fetch(`/api/contas-contabeis/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error updating chart of account');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete a chart of account
 */
export async function deleteChartOfAccount(id: string) {
  try {
    const response = await fetch(`/api/contas-contabeis/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (data.success) {
      return data;
    }
    throw new Error(data.error || 'Error deleting chart of account');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarContasContabeis = listChartOfAccounts;
export const obterContaContabil = getChartOfAccount;
export const criarContaContabil = createChartOfAccount;
export const atualizarContaContabil = updateChartOfAccount;
export const excluirContaContabil = deleteChartOfAccount;
export const obterStatsContasContabeis = getChartOfAccountsStats;


