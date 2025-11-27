import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { SdkErrorHandler } from '@/lib/sdk/error-handler';
import { normalizeListResponse, normalizePaginatedResponse } from '@/lib/sdk/response-normalizer';
import type { Product, CreateProductDto, UpdateProductDto, PaginatedResponse } from '@/types/sdk';

/**
 * Products Service
 * Uses SDK ProductsApiClient with SDK types
 */

/**
 * List products with pagination and filters
 *
 * NOTE: company_id is handled automatically by JWT token (multi-tenant).
 * Do not pass company_id in params as it's extracted from the token.
 */
export async function listProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<Product> | { data: Product[] }> {
  try {
    const productsClient = SdkClientFactory.getProductsClient();
    // Remove company_id from params if present (handled by JWT)
    const { company_id, ...cleanParams } = params || {};
    const response = await productsClient.findAll(cleanParams);

    // SDK returns PaginatedResponse<T> or T[] directly
    // Normalize to ensure consistent structure
    if (params?.page || params?.limit) {
      return normalizePaginatedResponse<Product>(response);
    }

    return {
      data: normalizeListResponse<Product>(response),
    };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(id: string): Promise<Product> {
  try {
    const productsClient = SdkClientFactory.getProductsClient();
    const product = await productsClient.findOne(id);
    return product;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new product
 */
export async function createProduct(payload: CreateProductDto): Promise<Product> {
  try {
    const productsClient = SdkClientFactory.getProductsClient();
    const product = await productsClient.create(payload);
    return product;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, payload: UpdateProductDto): Promise<Product> {
  try {
    const productsClient = SdkClientFactory.getProductsClient();
    const product = await productsClient.update(id, payload);
    return product;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string) {
  try {
    const productsClient = SdkClientFactory.getProductsClient();
    await productsClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarProdutos = listProducts;
export const obterProduto = getProduct;
export const criarProduto = createProduct;
export const atualizarProduto = updateProduct;
export const excluirProduto = deleteProduct;


