import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Accounts Receivable Service
 * Uses SDK AccountsReceivableApiClient
 */

/**
 * List accounts receivable with pagination and filters
 */
export async function listAccountsReceivable(params?: {
  page?: number;
  limit?: number;
  search?: string;
  company_id?: string;
  status?: string;
  [key: string]: any;
}) {
  try {
    const accountsReceivableClient = SdkClientFactory.getAccountsReceivableClient();
    const response = await accountsReceivableClient.findAll(params || {});
    return response;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single account receivable by ID
 */
export async function getAccountReceivable(id: string) {
  try {
    const accountsReceivableClient = SdkClientFactory.getAccountsReceivableClient();
    const accountReceivable = await accountsReceivableClient.findOne(id);
    return accountReceivable;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new account receivable
 */
export async function createAccountReceivable(payload: any) {
  try {
    const accountsReceivableClient = SdkClientFactory.getAccountsReceivableClient();
    const accountReceivable = await accountsReceivableClient.create(payload);
    return accountReceivable;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing account receivable
 */
export async function updateAccountReceivable(id: string, payload: Partial<any>) {
  try {
    const accountsReceivableClient = SdkClientFactory.getAccountsReceivableClient();
    const accountReceivable = await accountsReceivableClient.update(id, payload);
    return accountReceivable;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete an account receivable
 */
export async function deleteAccountReceivable(id: string) {
  try {
    const accountsReceivableClient = SdkClientFactory.getAccountsReceivableClient();
    await accountsReceivableClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarContasReceber = listAccountsReceivable;
export const obterContaReceber = getAccountReceivable;
export const criarContaReceber = createAccountReceivable;
export const atualizarContaReceber = updateAccountReceivable;
export const excluirContaReceber = deleteAccountReceivable;


