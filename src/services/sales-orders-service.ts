import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';
import { normalizeListResponse, normalizePaginatedResponse } from '@/lib/sdk/response-normalizer';
import axios from 'axios';
import type { SalesOrder, CreateSalesOrderDto, UpdateSalesOrderDto, SalesOrderStatus, SalesOrderChangeStatusDto, PaginatedResponse } from '@/types/sdk';

/**
 * Sales Orders Service
 * Uses SDK SalesOrdersApiClient for most operations
 * Some operations may still use direct API calls if not available in SDK
 */

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to get auth headers for legacy API calls
const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('fenix_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * List sales orders with pagination and filters
 */
export async function listSalesOrders(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: SalesOrderStatus;
  partnerId?: string;
}): Promise<PaginatedResponse<SalesOrder> | { data: SalesOrder[] }> {
  try {
    const salesOrdersClient = SdkClientFactory.getSalesOrdersClient();
    const response = await salesOrdersClient.findAll(params || {});

    // SDK returns PaginatedResponse<T> or T[] directly
    if (params?.page || params?.limit) {
      return normalizePaginatedResponse<SalesOrder>(response);
    }

    return {
      data: normalizeListResponse<SalesOrder>(response),
    };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single sales order by ID
 */
export async function getSalesOrder(id: string): Promise<SalesOrder> {
  try {
    const salesOrdersClient = SdkClientFactory.getSalesOrdersClient();
    const order = await salesOrdersClient.findOne(id);
    return order;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new sales order
 */
export async function createSalesOrder(payload: CreateSalesOrderDto): Promise<SalesOrder> {
  try {
    const salesOrdersClient = SdkClientFactory.getSalesOrdersClient();
    const order = await salesOrdersClient.create(payload);
    return order;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing sales order
 */
export async function updateSalesOrder(id: string, payload: UpdateSalesOrderDto): Promise<SalesOrder> {
  try {
    const salesOrdersClient = SdkClientFactory.getSalesOrdersClient();
    const order = await salesOrdersClient.update(id, payload);
    return order;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create sales order from quote
 */
export async function createSalesOrderFromQuote(quoteId: string, adjustments?: any) {
  try {
    const salesOrdersClient = SdkClientFactory.getSalesOrdersClient();
    const order = await salesOrdersClient.createFromQuote(quoteId);
    // Apply adjustments if provided (may need to update after creation)
    if (adjustments && Object.keys(adjustments).length > 0) {
      return await updateSalesOrder(order.id, adjustments);
    }
    return order;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Change sales order status
 */
export async function changeSalesOrderStatus(id: string, status: SalesOrderStatus): Promise<SalesOrder> {
  try {
    const salesOrdersClient = SdkClientFactory.getSalesOrdersClient();
    const statusDto: SalesOrderChangeStatusDto = { status };
    const order = await salesOrdersClient.changeStatus(id, statusDto);
    return order;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Recalculate taxes for a sales order
 */
export async function recalculateTaxes(id: string) {
  try {
    // Check if SDK has this method, otherwise use direct API
    const salesOrdersClient = SdkClientFactory.getSalesOrdersClient();
    if (typeof (salesOrdersClient as any).recalculateTaxes === 'function') {
      return await (salesOrdersClient as any).recalculateTaxes(id);
    }

    // Fallback to direct API call
    const { data } = await axios.post(
      `${API}/api/pedidos-venda/${id}/recalcular-impostos`,
      {},
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete a sales order
 */
export async function deleteSalesOrder(id: string) {
  try {
    const salesOrdersClient = SdkClientFactory.getSalesOrdersClient();
    await salesOrdersClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Deliver sales order (legacy API call - may not be in SDK)
 */
export async function deliverSalesOrder(
  orderId: string,
  companyId: string,
  stockLocationId: string,
  operationNature: any,
  items: any[],
  status: string
) {
  try {
    // This seems to be a custom endpoint, use direct API call
    const { data } = await axios.post(
      `/api/pedidos-venda/entregar`,
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
    console.error('[SalesOrders Service] Error delivering order:', error);
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility during migration
export const listarPedidosVenda = listSalesOrders;
export const obterPedidoVenda = getSalesOrder;
export const criarPedidoVenda = createSalesOrder;
export const atualizarPedidoVenda = updateSalesOrder;
export const criarPedidoVendaFromOrcamento = createSalesOrderFromQuote;
export const excluirPedidoVenda = deleteSalesOrder;
export const entregarPedidoVenda = deliverSalesOrder;

