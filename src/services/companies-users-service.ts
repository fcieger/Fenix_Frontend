import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Companies Users Service
 * Uses SDK CompaniesUsersApiClient
 */

/**
 * List company users with pagination and filters
 */
export async function listCompanyUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  company_id?: string;
  [key: string]: any;
}) {
  try {
    const companiesUsersClient = SdkClientFactory.getCompaniesUsersClient();
    const response = await companiesUsersClient.findAll(params || {});
    return response;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single company user by ID
 */
export async function getCompanyUser(id: string) {
  try {
    const companiesUsersClient = SdkClientFactory.getCompaniesUsersClient();
    const user = await companiesUsersClient.findOne(id);
    return user;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new company user
 */
export async function createCompanyUser(payload: any) {
  try {
    const companiesUsersClient = SdkClientFactory.getCompaniesUsersClient();
    const user = await companiesUsersClient.create(payload);
    return user;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing company user
 */
export async function updateCompanyUser(id: string, payload: Partial<any>) {
  try {
    const companiesUsersClient = SdkClientFactory.getCompaniesUsersClient();
    const user = await companiesUsersClient.update(id, payload);
    return user;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete a company user
 */
export async function deleteCompanyUser(id: string) {
  try {
    const companiesUsersClient = SdkClientFactory.getCompaniesUsersClient();
    await companiesUsersClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get user profile
 */
export async function getUserProfile() {
  try {
    const companiesUsersClient = SdkClientFactory.getCompaniesUsersClient();
    // Check if profile method exists
    if (typeof (companiesUsersClient as any).getProfile === 'function') {
      return await (companiesUsersClient as any).getProfile();
    }
    // Fallback: try to get current user
    if (typeof (companiesUsersClient as any).getCurrentUser === 'function') {
      return await (companiesUsersClient as any).getCurrentUser();
    }
    throw new Error('Profile method not available in SDK');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarUsuariosEmpresa = listCompanyUsers;
export const obterUsuarioEmpresa = getCompanyUser;
export const criarUsuarioEmpresa = createCompanyUser;
export const atualizarUsuarioEmpresa = updateCompanyUser;
export const excluirUsuarioEmpresa = deleteCompanyUser;
export const obterPerfilUsuario = getUserProfile;


