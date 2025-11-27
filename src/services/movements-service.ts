import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Financial Movements Service
 * Uses Next.js API routes
 *
 * NOTE: This service uses direct API routes because there's no corresponding SDK module.
 * The movements are handled through the FinancialAccountsApiClient indirectly,
 * but direct movement operations are not available in the SDK yet.
 *
 * TODO: Consider adding movements endpoints to the SDK in the future.
 */

/**
 * List financial movements
 */
export async function listMovements(params?: {
  conta_id?: string;
  company_id?: string;
  tipo_movimentacao?: string;
  data_inicio?: string;
  data_fim?: string;
  [key: string]: any;
}) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.conta_id) queryParams.append('conta_id', params.conta_id);
    if (params?.company_id) queryParams.append('company_id', params.company_id);
    if (params?.tipo_movimentacao) queryParams.append('tipo_movimentacao', params.tipo_movimentacao);
    if (params?.data_inicio) queryParams.append('data_inicio', params.data_inicio);
    if (params?.data_fim) queryParams.append('data_fim', params.data_fim);

    const response = await fetch(`/api/movimentacoes?${queryParams.toString()}`);
    const data = await response.json();

    if (data.success) {
      return { data: data.data, meta: {} };
    }
    throw new Error(data.error || 'Error fetching movements');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get movement summary
 */
export async function getMovementSummary(params?: {
  conta_id?: string;
  company_id?: string;
  [key: string]: any;
}) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.conta_id) queryParams.append('conta_id', params.conta_id);
    if (params?.company_id) queryParams.append('company_id', params.company_id);

    const response = await fetch(`/api/movimentacoes/resumo?${queryParams.toString()}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error fetching summary');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single movement by ID
 */
export async function getMovement(id: string) {
  try {
    const response = await fetch(`/api/movimentacoes/${id}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error fetching movement');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new movement
 */
export async function createMovement(payload: any) {
  try {
    const response = await fetch('/api/movimentacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error creating movement');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update a movement
 */
export async function updateMovement(id: string, payload: Partial<any>) {
  try {
    const response = await fetch(`/api/movimentacoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error updating movement');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete a movement
 */
export async function deleteMovement(id: string) {
  try {
    const response = await fetch(`/api/movimentacoes/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (data.success) {
      return data;
    }
    throw new Error(data.error || 'Error deleting movement');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarMovimentacoes = listMovements;
export const obterMovimentacao = getMovement;
export const criarMovimentacao = createMovement;
export const atualizarMovimentacao = updateMovement;
export const excluirMovimentacao = deleteMovement;
export const obterResumoMovimentacoes = getMovementSummary;


