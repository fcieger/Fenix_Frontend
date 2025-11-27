import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Accounts Payable Service
 * Uses SDK AccountsPayableApiClient
 */

/**
 * List accounts payable with pagination and filters
 */
export async function listAccountsPayable(params?: {
  page?: number;
  limit?: number;
  search?: string;
  company_id?: string;
  status?: string;
  [key: string]: any;
}) {
  try {
    const accountsPayableClient = SdkClientFactory.getAccountsPayableClient();
    const response = await accountsPayableClient.findAll(params || {});
    return response;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single account payable by ID
 */
export async function getAccountPayable(id: string) {
  try {
    const accountsPayableClient = SdkClientFactory.getAccountsPayableClient();
    const accountPayable = await accountsPayableClient.findOne(id);
    return accountPayable;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new account payable
 */
export async function createAccountPayable(payload: any) {
  try {
    const accountsPayableClient = SdkClientFactory.getAccountsPayableClient();
    const accountPayable = await accountsPayableClient.create(payload);
    return accountPayable;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing account payable
 */
export async function updateAccountPayable(id: string, payload: Partial<any>) {
  try {
    const accountsPayableClient = SdkClientFactory.getAccountsPayableClient();
    const accountPayable = await accountsPayableClient.update(id, payload);
    return accountPayable;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete an account payable
 */
export async function deleteAccountPayable(id: string) {
  try {
    const accountsPayableClient = SdkClientFactory.getAccountsPayableClient();
    await accountsPayableClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarContasPagar = listAccountsPayable;
export const obterContaPagar = getAccountPayable;
export const criarContaPagar = createAccountPayable;
export const atualizarContaPagar = updateAccountPayable;
export const excluirContaPagar = deleteAccountPayable;


