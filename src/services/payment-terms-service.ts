import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';
import type { PaymentTerm, CreatePaymentTermDto, UpdatePaymentTermDto } from '@/types/sdk';

/**
 * Payment Terms Service
 * Uses SDK PaymentTermsApiClient with SDK types
 */

/**
 * List payment terms
 */
export async function listPaymentTerms(params?: {
  company_id?: string;
}): Promise<PaymentTerm[]> {
  try {
    const paymentTermsClient = SdkClientFactory.getPaymentTermsClient();
    const response = await paymentTermsClient.findAll(params || {});
    return Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    // Fallback to Next.js API route
    try {
      const queryParams = new URLSearchParams();
      if (params?.company_id) queryParams.append('company_id', params.company_id);

      const response = await fetch(`/api/prazos-pagamento?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        return data.data || [];
      }
      throw new Error(data.error || 'Error fetching payment terms');
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Get a single payment term by ID
 */
export async function getPaymentTerm(id: string): Promise<PaymentTerm> {
  try {
    const paymentTermsClient = SdkClientFactory.getPaymentTermsClient();
    const term = await paymentTermsClient.findOne(id);
    return term;
  } catch (error) {
    // Fallback to Next.js API route
    try {
      const response = await fetch(`/api/prazos-pagamento/${id}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Error fetching payment term');
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Create a new payment term
 */
export async function createPaymentTerm(payload: CreatePaymentTermDto): Promise<PaymentTerm> {
  try {
    const paymentTermsClient = SdkClientFactory.getPaymentTermsClient();
    const term = await paymentTermsClient.create(payload);
    return term;
  } catch (error) {
    // Fallback to Next.js API route
    try {
      const response = await fetch('/api/prazos-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Error creating payment term');
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Update a payment term
 */
export async function updatePaymentTerm(id: string, payload: UpdatePaymentTermDto): Promise<PaymentTerm> {
  try {
    const paymentTermsClient = SdkClientFactory.getPaymentTermsClient();
    const term = await paymentTermsClient.update(id, payload);
    return term;
  } catch (error) {
    // Fallback to Next.js API route
    try {
      const response = await fetch(`/api/prazos-pagamento/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Error updating payment term');
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Delete a payment term
 */
export async function deletePaymentTerm(id: string) {
  try {
    const paymentTermsClient = SdkClientFactory.getPaymentTermsClient();
    await paymentTermsClient.delete(id);
    return { success: true };
  } catch (error) {
    // Fallback to Next.js API route
    try {
      const response = await fetch(`/api/prazos-pagamento/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        return data;
      }
      throw new Error(data.error || 'Error deleting payment term');
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

// Legacy function names for backward compatibility
export const listarPrazosPagamento = listPaymentTerms;
export const obterPrazoPagamento = getPaymentTerm;
export const criarPrazoPagamento = createPaymentTerm;
export const atualizarPrazoPagamento = updatePaymentTerm;
export const excluirPrazoPagamento = deletePaymentTerm;


