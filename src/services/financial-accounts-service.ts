import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';
import type { FinancialAccount, CreateFinancialAccountDto, UpdateFinancialAccountDto } from '@/types/sdk';

/**
 * Financial Accounts Service
 * Uses SDK FinancialAccountsApiClient with SDK types
 * Falls back to Next.js API routes for operations not in SDK
 */

/**
 * List financial accounts with filters
 *
 * NOTE: company_id is handled automatically by JWT token (multi-tenant).
 * Do not pass company_id in params as it's extracted from the token.
 */
export async function listFinancialAccounts(params?: {
  status?: string;
  tipo_conta?: string;
}): Promise<FinancialAccount[]> {
  try {
    // Try SDK first
    const financialAccountsClient = SdkClientFactory.getFinancialAccountsClient();
    // Remove company_id from params if present (handled by JWT)
    const { company_id, ...cleanParams } = params || {};
    const response = await financialAccountsClient.findAll(cleanParams);
    return Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    // Fallback to Next.js API route
    try {
      const queryParams = new URLSearchParams();
      // Don't append company_id - handled by JWT
      if (params?.status) queryParams.append('status', params.status);
      if (params?.tipo_conta) queryParams.append('tipo_conta', params.tipo_conta);

      const response = await fetch(`/api/contas?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        return data.data || [];
      }
      throw new Error(data.error || 'Error fetching accounts');
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Get a single financial account by ID
 */
export async function getFinancialAccount(id: string): Promise<FinancialAccount> {
  try {
    const financialAccountsClient = SdkClientFactory.getFinancialAccountsClient();
    const account = await financialAccountsClient.findOne(id);
    return account;
  } catch (error) {
    // Fallback to Next.js API route
    try {
      const response = await fetch(`/api/contas/${id}`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Error fetching account');
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Create a new financial account
 */
export async function createFinancialAccount(payload: CreateFinancialAccountDto): Promise<FinancialAccount> {
  try {
    const financialAccountsClient = SdkClientFactory.getFinancialAccountsClient();
    const account = await financialAccountsClient.create(payload);
    return account;
  } catch (error) {
    // Fallback to Next.js API route
    try {
      const response = await fetch('/api/contas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Error creating account');
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Update an existing financial account
 */
export async function updateFinancialAccount(id: string, payload: UpdateFinancialAccountDto): Promise<FinancialAccount> {
  try {
    const financialAccountsClient = SdkClientFactory.getFinancialAccountsClient();
    const account = await financialAccountsClient.update(id, payload);
    return account;
  } catch (error) {
    // Fallback to Next.js API route
    try {
      const response = await fetch(`/api/contas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Error updating account');
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Delete a financial account
 */
export async function deleteFinancialAccount(id: string) {
  try {
    const financialAccountsClient = SdkClientFactory.getFinancialAccountsClient();
    await financialAccountsClient.delete(id);
    return { success: true };
  } catch (error) {
    // Fallback to Next.js API route
    try {
      const response = await fetch(`/api/contas/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        return data;
      }
      throw new Error(data.error || 'Error deleting account');
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

// Legacy function names for backward compatibility
export const listarContas = listFinancialAccounts;
export const obterConta = getFinancialAccount;
export const criarConta = createFinancialAccount;
export const atualizarConta = updateFinancialAccount;
export const excluirConta = deleteFinancialAccount;


