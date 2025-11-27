import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Cost Centers Service
 * Uses Next.js API routes
 *
 * NOTE: This service uses direct API routes because there's no CostCentersApiClient in the SDK.
 *
 * TODO: Consider adding CostCentersApiClient to the SDK in the future.
 */

/**
 * List cost centers with filters
 */
export async function listCostCenters(params?: {
  company_id?: string;
  centro_pai_id?: string | null;
  ativo?: boolean;
  search?: string;
  [key: string]: any;
}) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.company_id) queryParams.append('company_id', params.company_id);
    if (params?.centro_pai_id !== undefined) {
      queryParams.append('centro_pai_id', params.centro_pai_id === null ? 'null' : params.centro_pai_id);
    }
    if (params?.ativo !== undefined) queryParams.append('ativo', params.ativo.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`/api/centros-custos?${queryParams.toString()}`);
    const data = await response.json();

    if (data.success) {
      return { data: data.data, meta: {} };
    }
    throw new Error(data.error || 'Error fetching cost centers');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get cost centers stats
 */
export async function getCostCentersStats(params?: {
  company_id?: string;
  [key: string]: any;
}) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.company_id) queryParams.append('company_id', params.company_id);

    const response = await fetch(`/api/centros-custos/stats?${queryParams.toString()}`);
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
 * Get a single cost center by ID
 */
export async function getCostCenter(id: string) {
  try {
    const response = await fetch(`/api/centros-custos/${id}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error fetching cost center');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new cost center
 */
export async function createCostCenter(payload: any) {
  try {
    const response = await fetch('/api/centros-custos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error creating cost center');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update a cost center
 */
export async function updateCostCenter(id: string, payload: Partial<any>) {
  try {
    const response = await fetch(`/api/centros-custos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error updating cost center');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete a cost center
 */
export async function deleteCostCenter(id: string) {
  try {
    const response = await fetch(`/api/centros-custos/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error deleting cost center');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarCentrosCustos = listCostCenters;
export const obterCentroCusto = getCostCenter;
export const criarCentroCusto = createCostCenter;
export const atualizarCentroCusto = updateCostCenter;
export const excluirCentroCusto = deleteCostCenter;
export const obterStatsCentrosCustos = getCostCentersStats;


