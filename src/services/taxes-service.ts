import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Taxes Service
 * Uses SDK TaxesApiClient
 */

/**
 * List taxes with pagination and filters
 */
export async function listTaxes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  company_id?: string;
  [key: string]: any;
}) {
  try {
    const taxesClient = SdkClientFactory.getTaxesClient();
    const response = await taxesClient.findAll(params || {});
    return response;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single tax by ID
 */
export async function getTax(id: string) {
  try {
    const taxesClient = SdkClientFactory.getTaxesClient();
    const tax = await taxesClient.findOne(id);
    return tax;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new tax
 */
export async function createTax(payload: any) {
  try {
    const taxesClient = SdkClientFactory.getTaxesClient();
    const tax = await taxesClient.create(payload);
    return tax;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing tax
 */
export async function updateTax(id: string, payload: Partial<any>) {
  try {
    const taxesClient = SdkClientFactory.getTaxesClient();
    const tax = await taxesClient.update(id, payload);
    return tax;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete a tax
 */
export async function deleteTax(id: string) {
  try {
    const taxesClient = SdkClientFactory.getTaxesClient();
    await taxesClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarImpostos = listTaxes;
export const obterImposto = getTax;
export const criarImposto = createTax;
export const atualizarImposto = updateTax;
export const excluirImposto = deleteTax;


