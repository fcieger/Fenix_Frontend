import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';

/**
 * Payment Methods Service
 * Uses Next.js API routes
 *
 * NOTE: This service uses direct API routes because there's no PaymentMethodsApiClient in the SDK.
 * Payment methods are typically managed through other modules (e.g., payment terms).
 *
 * TODO: Consider adding PaymentMethodsApiClient to the SDK in the future.
 */

/**
 * List payment methods
 */
export async function listPaymentMethods(params?: {
  company_id?: string;
  [key: string]: any;
}) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.company_id) queryParams.append('company_id', params.company_id);

    const response = await fetch(`/api/formas-pagamento?${queryParams.toString()}`);
    const data = await response.json();

    if (data.success) {
      return { data: data.data, meta: {} };
    }
    throw new Error(data.error || 'Error fetching payment methods');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single payment method by ID
 */
export async function getPaymentMethod(id: string) {
  try {
    const response = await fetch(`/api/formas-pagamento/${id}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error fetching payment method');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new payment method
 */
export async function createPaymentMethod(payload: any) {
  try {
    const response = await fetch('/api/formas-pagamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error creating payment method');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update a payment method
 */
export async function updatePaymentMethod(id: string, payload: Partial<any>) {
  try {
    const response = await fetch(`/api/formas-pagamento/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Error updating payment method');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(id: string) {
  try {
    const response = await fetch(`/api/formas-pagamento/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (data.success) {
      return data;
    }
    throw new Error(data.error || 'Error deleting payment method');
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarFormasPagamento = listPaymentMethods;
export const obterFormaPagamento = getPaymentMethod;
export const criarFormaPagamento = createPaymentMethod;
export const atualizarFormaPagamento = updatePaymentMethod;
export const excluirFormaPagamento = deletePaymentMethod;


