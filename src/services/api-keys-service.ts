import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * API Keys Service
 * Uses SDK ApiKeysApiClient
 */

/**
 * List API keys with pagination and filters
 */
export async function listApiKeys(params?: {
  page?: number;
  limit?: number;
  company_id?: string;
  [key: string]: any;
}) {
  try {
    const apiKeysClient = SdkClientFactory.getApiKeysClient();
    const response = await apiKeysClient.findAll(params || {});
    return response;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single API key by ID
 */
export async function getApiKey(id: string) {
  try {
    const apiKeysClient = SdkClientFactory.getApiKeysClient();
    const apiKey = await apiKeysClient.findOne(id);
    return apiKey;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new API key
 */
export async function createApiKey(payload: any) {
  try {
    const apiKeysClient = SdkClientFactory.getApiKeysClient();
    const apiKey = await apiKeysClient.create(payload);
    return apiKey;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing API key
 */
export async function updateApiKey(id: string, payload: Partial<any>) {
  try {
    const apiKeysClient = SdkClientFactory.getApiKeysClient();
    const apiKey = await apiKeysClient.update(id, payload);
    return apiKey;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete an API key
 */
export async function deleteApiKey(id: string) {
  try {
    const apiKeysClient = SdkClientFactory.getApiKeysClient();
    await apiKeysClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(id: string) {
  try {
    const apiKeysClient = SdkClientFactory.getApiKeysClient();
    if (typeof (apiKeysClient as any).revoke === 'function') {
      return await (apiKeysClient as any).revoke(id);
    }
    // Fallback: update status
    return await updateApiKey(id, { status: 'revoked' });
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarChavesApi = listApiKeys;
export const obterChaveApi = getApiKey;
export const criarChaveApi = createApiKey;
export const atualizarChaveApi = updateApiKey;
export const excluirChaveApi = deleteApiKey;
export const revogarChaveApi = revokeApiKey;


