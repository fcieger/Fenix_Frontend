import { BaseService } from '@/lib/services/base-service';
import { SdkClientFactory } from '@/lib/sdk/client-factory';
import { normalizeListResponse, normalizePaginatedResponse } from '@/lib/sdk/response-normalizer';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  PaginatedResponse,
} from '@/types/sdk';
import {
  formatCreateProductRequest,
  formatUpdateProductRequest,
  formatProductResponse,
  formatProductsListResponse,
} from './products-transformers';

/**
 * Products Service
 * Uses SDK ProductsApiClient with request/response formatting
 */
class ProductsService extends BaseService<
  CreateProductDto | UpdateProductDto,
  Product | Product[] | PaginatedResponse<Product>,
  CreateProductDto | UpdateProductDto,
  Product | Product[] | PaginatedResponse<Product>
> {
  constructor() {
    super({
      formatResponse: (data) => {
        if (Array.isArray(data)) {
          return formatProductsListResponse(data) as any;
        }
        if ('data' in data && Array.isArray(data.data)) {
          return {
            ...data,
            data: formatProductsListResponse(data.data),
          } as any;
        }
        return formatProductResponse(data as Product) as any;
      },
    });
  }

  /**
   * List products with pagination and filters
   *
   * NOTE: company_id is handled automatically by JWT token (multi-tenant).
   * Do not pass company_id in params as it's extracted from the token.
   */
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Product> | { data: Product[] }> {
    try {
      const productsClient = SdkClientFactory.getProductsClient();
      // Remove company_id from params if present (handled by JWT)
      const cleanParams = { ...(params || {}) };
      if ('company_id' in cleanParams) {
        delete (cleanParams as any).company_id;
      }
      const response = await productsClient.findAll(cleanParams);

      // Normalizar resposta
      let normalized: PaginatedResponse<Product> | Product[];
      if (params?.page || params?.limit) {
        normalized = normalizePaginatedResponse<Product>(response);
      } else {
        normalized = {
          data: normalizeListResponse<Product>(response),
        } as any;
      }

      // Aplicar formatResponse
      return this.formatResponse(normalized) as
        | PaginatedResponse<Product>
        | { data: Product[] };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get a single product by ID
   */
  async get(id: string): Promise<Product> {
    try {
      const productsClient = SdkClientFactory.getProductsClient();
      const product = await productsClient.findOne(id);
      return this.formatResponse(product) as Product;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Create a new product
   */
  async create(payload: CreateProductDto): Promise<Product> {
    try {
      const productsClient = SdkClientFactory.getProductsClient();
      // Formatar request antes de enviar
      const formattedPayload = formatCreateProductRequest(payload);
      const product = await productsClient.create(formattedPayload);
      // Formatar response antes de retornar
      return this.formatResponse(product) as Product;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update an existing product
   */
  async update(id: string, payload: UpdateProductDto): Promise<Product> {
    try {
      const productsClient = SdkClientFactory.getProductsClient();
      // Formatar request antes de enviar
      const formattedPayload = formatUpdateProductRequest(payload);
      const product = await productsClient.update(id, formattedPayload);
      // Formatar response antes de retornar
      return this.formatResponse(product) as Product;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete a product
   */
  async delete(id: string) {
    try {
      const productsClient = SdkClientFactory.getProductsClient();
      await productsClient.delete(id);
      return { success: true };
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Export singleton instance
export const productsService = new ProductsService();

// Export functions for backward compatibility
export const listProducts = (
  params?: Parameters<ProductsService['list']>[0]
) => productsService.list(params);
export const getProduct = (id: string) => productsService.get(id);
export const createProduct = (payload: CreateProductDto) =>
  productsService.create(payload);
export const updateProduct = (id: string, payload: UpdateProductDto) =>
  productsService.update(id, payload);
export const deleteProduct = (id: string) => productsService.delete(id);

// Legacy function names for backward compatibility
export const listarProdutos = listProducts;
export const obterProduto = getProduct;
export const criarProduto = createProduct;
export const atualizarProduto = updateProduct;
export const excluirProduto = deleteProduct;
