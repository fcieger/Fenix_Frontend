import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * NFe Config Service
 * Uses SDK NfeConfigApiClient
 */

/**
 * List NFe configurations with pagination and filters
 */
export async function listNfeConfigs(params?: {
  page?: number;
  limit?: number;
  company_id?: string;
  [key: string]: any;
}) {
  try {
    const nfeConfigClient = SdkClientFactory.getNfeConfigClient();
    const response = await nfeConfigClient.findAll(params || {});
    return response;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single NFe config by ID
 */
export async function getNfeConfig(id: string) {
  try {
    const nfeConfigClient = SdkClientFactory.getNfeConfigClient();
    const config = await nfeConfigClient.findOne(id);
    return config;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new NFe config
 */
export async function createNfeConfig(payload: any) {
  try {
    const nfeConfigClient = SdkClientFactory.getNfeConfigClient();
    const config = await nfeConfigClient.create(payload);
    return config;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing NFe config
 */
export async function updateNfeConfig(id: string, payload: Partial<any>) {
  try {
    const nfeConfigClient = SdkClientFactory.getNfeConfigClient();
    const config = await nfeConfigClient.update(id, payload);
    return config;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete an NFe config
 */
export async function deleteNfeConfig(id: string) {
  try {
    const nfeConfigClient = SdkClientFactory.getNfeConfigClient();
    await nfeConfigClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get next sequential number for NFe
 */
export async function getNextNfeNumber(configId: string) {
  try {
    const nfeConfigClient = SdkClientFactory.getNfeConfigClient();
    if (typeof (nfeConfigClient as any).getNextNumber === 'function') {
      return await (nfeConfigClient as any).getNextNumber(configId);
    }
    // Fallback: get config and increment
    const config = await getNfeConfig(configId);
    return {
      numeroAtual: (config.numeroAtual || 0) + 1,
      configuracaoId: configId
    };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarConfiguracoesNfe = listNfeConfigs;
export const obterConfiguracaoNfe = getNfeConfig;
export const criarConfiguracaoNfe = createNfeConfig;
export const atualizarConfiguracaoNfe = updateNfeConfig;
export const excluirConfiguracaoNfe = deleteNfeConfig;
export const obterProximoNumeroNfe = getNextNfeNumber;


