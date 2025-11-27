import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';
import { normalizeListResponse, normalizePaginatedResponse } from '@/lib/sdk/response-normalizer';
import axios from 'axios';
import type { PurchaseOrder, CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrderStatus, PurchaseOrderChangeStatusDto, PaginatedResponse } from '@/types/sdk';

/**
 * Purchase Orders Service
 * Uses SDK PurchaseOrdersApiClient for most operations
 * Some operations may still use direct API calls if not available in SDK
 */

// Helper function to get API URL (relative for Next.js routes)
const getApiUrl = () => {
  return typeof window !== 'undefined' ? '' : 'http://localhost:3004';
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('fenix_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * List purchase orders with pagination and filters
 *
 * NOTE: company_id is handled automatically by JWT token (multi-tenant).
 * Do not pass company_id or companyId in params as it's extracted from the token.
 */
export async function listPurchaseOrders(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: PurchaseOrderStatus;
  partnerId?: string;
}): Promise<PaginatedResponse<PurchaseOrder> | { data: PurchaseOrder[] }> {
  try {
    const purchaseOrdersClient = SdkClientFactory.getPurchaseOrdersClient();
    // Remove company_id/companyId from params if present (handled by JWT)
    const { company_id, companyId, ...cleanParams } = params || {};
    const response = await purchaseOrdersClient.findAll(cleanParams);

    // SDK returns PaginatedResponse<T> or T[] directly
    if (params?.page || params?.limit) {
      return normalizePaginatedResponse<PurchaseOrder>(response);
    }

    return {
      data: normalizeListResponse<PurchaseOrder>(response),
    };
  } catch (error) {
    // Fallback to direct API call if SDK fails
    try {
      const apiUrl = getApiUrl();
      const { data } = await axios.get(`${apiUrl}/api/pedidos-compra`, {
        params: cleanParams,
        headers: getAuthHeaders(),
      });
      const normalized = normalizeListResponse<PurchaseOrder>(data);
      return {
        data: normalized,
      };
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Get a single purchase order by ID
 *
 * NOTE: company_id is handled automatically by JWT token (multi-tenant).
 * Do not pass companyId parameter as it's extracted from the token.
 */
export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  try {
    const purchaseOrdersClient = SdkClientFactory.getPurchaseOrdersClient();
    const order = await purchaseOrdersClient.findOne(id);
    return order;
  } catch (error) {
    // Fallback to direct API call
    try {
      const apiUrl = getApiUrl();
      const { data } = await axios.get(`${apiUrl}/api/pedidos-compra/${id}`, {
        headers: getAuthHeaders(),
      });
      return data?.data || data;
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Create a new purchase order
 */
export async function createPurchaseOrder(payload: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
  try {
    const purchaseOrdersClient = SdkClientFactory.getPurchaseOrdersClient();
    const order = await purchaseOrdersClient.create(payload);
    return order;
  } catch (error) {
    // Fallback to direct API call
    try {
      const apiUrl = getApiUrl();
      const { data } = await axios.post(`${apiUrl}/api/pedidos-compra`, payload, {
        headers: getAuthHeaders(),
      });
      return data?.data || data;
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Update an existing purchase order
 */
export async function updatePurchaseOrder(id: string, payload: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
  try {
    const purchaseOrdersClient = SdkClientFactory.getPurchaseOrdersClient();
    const order = await purchaseOrdersClient.update(id, payload);
    return order;
  } catch (error) {
    // Fallback to direct API call
    try {
      const apiUrl = getApiUrl();
      const { data } = await axios.put(`${apiUrl}/api/pedidos-compra/${id}`, payload, {
        headers: getAuthHeaders(),
      });
      return data?.data || data;
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Recalculate taxes for a purchase order
 */
export async function recalculateTaxes(id: string) {
  try {
    const apiUrl = getApiUrl();
    const { data } = await axios.post(
      `${apiUrl}/api/pedidos-compra/${id}/recalcular-impostos`,
      {},
      { headers: getAuthHeaders() }
    );
    return data?.data || data;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete a purchase order
 */
export async function deletePurchaseOrder(id: string) {
  try {
    const purchaseOrdersClient = SdkClientFactory.getPurchaseOrdersClient();
    await purchaseOrdersClient.delete(id);
    return { success: true };
  } catch (error) {
    // Fallback to direct API call
    try {
      const apiUrl = getApiUrl();
      const { data } = await axios.delete(`${apiUrl}/api/pedidos-compra/${id}`, {
        headers: getAuthHeaders(),
      });
      return data?.data || data;
    } catch (fallbackError) {
      const errorInfo = SdkErrorHandler.handleError(fallbackError);
      throw new Error(errorInfo.message);
    }
  }
}

/**
 * Deliver purchase order (legacy API call)
 */
export async function deliverPurchaseOrder(
  orderId: string,
  companyId: string,
  stockLocationId: string,
  operationNature: any,
  items: any[],
  status: string
) {
  try {
    const { data } = await axios.post(
      `/api/pedidos-compra/entregar`,
      {
        pedidoId: orderId,
        companyId,
        localEstoqueId: stockLocationId,
        naturezaOperacao: operationNature,
        itens: items,
        status,
      },
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error: any) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility during migration
export const listarPedidosCompra = listPurchaseOrders;
export const obterPedidoCompra = getPurchaseOrder;
export const criarPedidoCompra = createPurchaseOrder;
export const atualizarPedidoCompra = updatePurchaseOrder;
export const excluirPedidoCompra = deletePurchaseOrder;
export const entregarPedidoCompra = deliverPurchaseOrder;

