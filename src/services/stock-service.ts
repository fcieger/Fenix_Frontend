import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';
import type { StockMovement, CreateStockMovementDto, StockBalance, GetMovementQueryParams, GetBalanceQueryParams, StockMovementType, PaginatedResponse } from '@/types/sdk';

/**
 * Stock Service
 * Uses SDK StockApiClient with SDK types
 */

/**
 * List stock movements
 */
export async function listStockMovements(params?: GetMovementQueryParams): Promise<PaginatedResponse<StockMovement> | StockMovement[]> {
  try {
    const stockClient = SdkClientFactory.getStockClient();
    const response = await stockClient.findAll(params || {});
    return Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a stock movement
 */
export async function createStockMovement(payload: CreateStockMovementDto): Promise<StockMovement> {
  try {
    const stockClient = SdkClientFactory.getStockClient();
    const movement = await stockClient.create(payload);
    return movement;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get stock balance
 */
export async function getStockBalance(params?: GetBalanceQueryParams | string): Promise<StockBalance | StockBalance[]> {
  try {
    const stockClient = SdkClientFactory.getStockClient();
    if (typeof params === 'string') {
      // Legacy: productId as string
      return await stockClient.getBalance({ productId: params });
    }
    return await stockClient.getBalance(params);
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarMovimentacoesEstoque = listStockMovements;
export const criarMovimentacaoEstoque = createStockMovement;
export const obterSaldoEstoque = getStockBalance;


