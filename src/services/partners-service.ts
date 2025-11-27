import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';
import { normalizeListResponse, normalizePaginatedResponse } from '@/lib/sdk/response-normalizer';
import type { Partner, CreatePartnerDto, UpdatePartnerDto, PartnerQueryParams, PaginatedResponse } from '@/types/sdk';

/**
 * Partners Service
 * Uses SDK PartnersApiClient with SDK types
 */

/**
 * List partners with pagination and filters
 *
 * NOTE: company_id is handled automatically by JWT token (multi-tenant).
 * Do not pass company_id in params as it's extracted from the token.
 */
export async function listPartners(params?: PartnerQueryParams): Promise<PaginatedResponse<Partner> | { data: Partner[] }> {
  try {
    const partnersClient = SdkClientFactory.getPartnersClient();
    // Remove company_id from params if present (handled by JWT)
    const { company_id, ...cleanParams } = params || {};
    const response = await partnersClient.findAll(cleanParams);

    // SDK returns PaginatedResponse<T> or T[] directly
    if (params?.page || params?.limit) {
      return normalizePaginatedResponse<Partner>(response);
    }

    return {
      data: normalizeListResponse<Partner>(response),
    };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single partner by ID
 */
export async function getPartner(id: string): Promise<Partner> {
  try {
    const partnersClient = SdkClientFactory.getPartnersClient();
    const partner = await partnersClient.findOne(id);
    return partner;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new partner
 */
export async function createPartner(payload: CreatePartnerDto): Promise<Partner> {
  try {
    const partnersClient = SdkClientFactory.getPartnersClient();
    const partner = await partnersClient.createWithValidation(payload);
    return partner;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing partner
 */
export async function updatePartner(id: string, payload: UpdatePartnerDto): Promise<Partner> {
  try {
    const partnersClient = SdkClientFactory.getPartnersClient();
    const partner = await partnersClient.updateWithValidation(id, payload);
    return partner;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete a partner
 */
export async function deletePartner(id: string) {
  try {
    const partnersClient = SdkClientFactory.getPartnersClient();
    await partnersClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarCadastros = listPartners;
export const obterCadastro = getPartner;
export const criarCadastro = createPartner;
export const atualizarCadastro = updatePartner;
export const excluirCadastro = deletePartner;


