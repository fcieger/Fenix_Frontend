import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Operation Nature Service
 * Uses SDK OperationNatureApiClient
 */

/**
 * List operation natures with pagination and filters
 */
export async function listOperationNatures(params?: {
  page?: number;
  limit?: number;
  search?: string;
  company_id?: string;
  tipo?: string;
  [key: string]: any;
}) {
  try {
    const operationNatureClient = SdkClientFactory.getOperationNatureClient();
    const response = await operationNatureClient.findAll(params || {});
    return response;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single operation nature by ID
 */
export async function getOperationNature(id: string) {
  try {
    const operationNatureClient = SdkClientFactory.getOperationNatureClient();
    const nature = await operationNatureClient.findOne(id);
    return nature;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new operation nature
 */
export async function createOperationNature(payload: any) {
  try {
    const operationNatureClient = SdkClientFactory.getOperationNatureClient();
    const nature = await operationNatureClient.create(payload);
    return nature;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing operation nature
 */
export async function updateOperationNature(id: string, payload: Partial<any>) {
  try {
    const operationNatureClient = SdkClientFactory.getOperationNatureClient();
    const nature = await operationNatureClient.update(id, payload);
    return nature;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete an operation nature
 */
export async function deleteOperationNature(id: string) {
  try {
    const operationNatureClient = SdkClientFactory.getOperationNatureClient();
    await operationNatureClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarNaturezasOperacao = listOperationNatures;
export const obterNaturezaOperacao = getOperationNature;
export const criarNaturezaOperacao = createOperationNature;
export const atualizarNaturezaOperacao = updateOperationNature;
export const excluirNaturezaOperacao = deleteOperationNature;


