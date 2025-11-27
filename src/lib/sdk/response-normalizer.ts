/**
 * SDK Response Normalizer
 *
 * The SDK returns responses in a standardized format:
 * - Paginated responses: PaginatedResponse<T> with { data: T[], meta: {...} }
 * - List responses: T[] (array directly)
 * - Single item: T (object directly)
 *
 * These functions handle edge cases and ensure type safety.
 */

import type { PaginatedResponse } from '@fenix/api-sdk';

/**
 * Extract data array from SDK response
 * Handles both PaginatedResponse<T> and direct array responses
 */
export function normalizeListResponse<T>(response: PaginatedResponse<T> | T[] | null | undefined): T[] {
  if (!response) {
    return [];
  }

  // If response is already an array, return it
  if (Array.isArray(response)) {
    return response;
  }

  // If response is PaginatedResponse, extract data array
  if ('data' in response && Array.isArray(response.data)) {
    return response.data;
  }

  // If no array found, return empty array
  return [];
}

/**
 * Extract single item from SDK response
 * SDK typically returns items directly, but handles wrapped responses
 */
export function normalizeItemResponse<T>(response: T | { data: T } | null | undefined): T | null {
  if (!response) {
    return null;
  }

  // If response is wrapped in { data: T }
  if ('data' in response && typeof response === 'object' && !Array.isArray(response)) {
    return response.data;
  }

  // Otherwise, assume response is the item itself
  return response as T;
}

/**
 * Normalize paginated response
 * SDK returns PaginatedResponse<T> directly, but this ensures consistent structure
 */
export function normalizePaginatedResponse<T>(response: PaginatedResponse<T> | T[] | null | undefined): PaginatedResponse<T> {
  if (!response) {
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  // If response is already PaginatedResponse, return it
  if ('data' in response && 'meta' in response) {
    return response as PaginatedResponse<T>;
  }

  // If response is array, wrap it in PaginatedResponse format
  if (Array.isArray(response)) {
    return {
      data: response,
      meta: {
        total: response.length,
        page: 1,
        limit: response.length,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  // Fallback
  return {
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
}

