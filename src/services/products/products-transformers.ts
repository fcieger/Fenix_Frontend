import type { CreateProductDto, UpdateProductDto, Product } from '@/types/sdk';
import {
  normalizeString,
  normalizeNumber,
  normalizeCode,
} from '@/lib/services/transformers/common-transformers';

/**
 * Products Transformers
 * Transformadores específicos para formatação de dados de produtos
 */

/**
 * Formata o payload de criação de produto antes de enviar
 */
export function formatCreateProductRequest(
  payload: CreateProductDto
): CreateProductDto {
  const formatted: any = { ...payload };

  // Normalizar código (uppercase, sem espaços)
  if (formatted.code) {
    formatted.code = normalizeCode(formatted.code);
  }

  // Normalizar preço (garantir número)
  if (formatted.price !== undefined) {
    formatted.price = normalizeNumber(formatted.price);
  }

  // Normalizar descrição (trim)
  if (formatted.description) {
    formatted.description = normalizeString(formatted.description);
  }

  // Normalizar unidade de medida (uppercase)
  if (formatted.unit) {
    formatted.unit = formatted.unit.toUpperCase().trim();
  }

  // Normalizar código de barras (remover espaços)
  if (formatted.barcode) {
    formatted.barcode = formatted.barcode.replace(/\s+/g, '');
  }

  // Normalizar SKU (uppercase, sem espaços)
  if (formatted.sku) {
    formatted.sku = normalizeCode(formatted.sku);
  }

  return formatted;
}

/**
 * Formata o payload de atualização de produto
 */
export function formatUpdateProductRequest(
  payload: UpdateProductDto
): UpdateProductDto {
  // Reutilizar formatação de criação
  return formatCreateProductRequest(payload as CreateProductDto) as UpdateProductDto;
}

/**
 * Formata a resposta do produto após receber da API
 */
export function formatProductResponse(product: Product): Product {
  const formatted: any = { ...product };

  // Garantir que preço é número
  if (formatted.price !== undefined) {
    formatted.price = normalizeNumber(formatted.price);
  }

  // Garantir que custo é número
  if (formatted.cost !== undefined) {
    formatted.cost = normalizeNumber(formatted.cost);
  }

  // Adicionar campo calculado de margem de lucro (se ambos existirem)
  if (formatted.price && formatted.cost && formatted.price > 0) {
    (formatted as any).profitMargin =
      ((formatted.price - formatted.cost) / formatted.price) * 100;
  }

  // Garantir que estoque é número
  if (formatted.stock !== undefined) {
    formatted.stock = normalizeNumber(formatted.stock);
  }

  return formatted;
}

/**
 * Formata lista de produtos
 */
export function formatProductsListResponse(products: Product[]): Product[] {
  return products.map(formatProductResponse);
}
