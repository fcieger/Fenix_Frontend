import { SdkClientFactory } from "@/lib/sdk/client-factory";
import { SdkErrorHandler } from "@/lib/sdk/error-handler";
import { normalizeListResponse, normalizePaginatedResponse } from "@/lib/sdk/response-normalizer";
import type { Quote, CreateQuoteDto, UpdateQuoteDto, QuoteStatus, QuoteChangeStatusDto, PaginatedResponse } from "@/types/sdk";

/**
 * Quotes Service
 * Uses SDK QuotesApiClient with SDK types
 */

/**
 * List quotes with pagination and filters
 */
export async function listQuotes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuoteStatus;
  partnerId?: string;
}): Promise<PaginatedResponse<Quote> | { data: Quote[] }> {
  try {
    const quotesClient = SdkClientFactory.getQuotesClient();
    const response = await quotesClient.findAll(params || {});

    // SDK returns PaginatedResponse<T> or T[] directly
    if (params?.page || params?.limit) {
      return normalizePaginatedResponse<Quote>(response);
    }

    return {
      data: normalizeListResponse<Quote>(response),
    };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Get a single quote by ID
 */
export async function getQuote(id: string): Promise<Quote> {
  try {
    const quotesClient = SdkClientFactory.getQuotesClient();
    const quote = await quotesClient.findOne(id);
    return quote;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Create a new quote
 */
export async function createQuote(payload: CreateQuoteDto): Promise<Quote> {
  try {
    const quotesClient = SdkClientFactory.getQuotesClient();
    const quote = await quotesClient.create(payload);
    return quote;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Update an existing quote
 */
export async function updateQuote(id: string, payload: UpdateQuoteDto): Promise<Quote> {
  try {
    const quotesClient = SdkClientFactory.getQuotesClient();
    const quote = await quotesClient.update(id, payload);
    return quote;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Change quote status
 */
export async function changeQuoteStatus(id: string, status: QuoteStatus): Promise<Quote> {
  try {
    const quotesClient = SdkClientFactory.getQuotesClient();
    const statusDto: QuoteChangeStatusDto = { status };
    const quote = await quotesClient.changeStatus(id, statusDto);
    return quote;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Recalculate taxes for a quote
 */
export async function recalculateTaxes(id: string) {
  try {
    const quotesClient = SdkClientFactory.getQuotesClient();
    const quote = await quotesClient.recalculateTaxes(id);
    return quote;
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

/**
 * Delete a quote
 */
export async function deleteQuote(id: string) {
  try {
    const quotesClient = SdkClientFactory.getQuotesClient();
    await quotesClient.delete(id);
    return { success: true };
  } catch (error) {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }
}

// Legacy function names for backward compatibility
export const listarOrcamentos = listQuotes;
export const obterOrcamento = getQuote;
export const criarOrcamento = createQuote;
export const atualizarOrcamento = updateQuote;
export const alterarStatusOrcamento = changeQuoteStatus;
export const recalcularImpostos = recalculateTaxes;
export const excluirOrcamento = deleteQuote;
