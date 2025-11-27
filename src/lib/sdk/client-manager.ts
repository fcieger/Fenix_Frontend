"use client";

import { useEffect, useMemo } from "react";
import { SdkClientFactory } from "./client-factory";
import { SdkErrorHandler } from "./error-handler";

/**
 * Client type keys for type-safe client access
 */
export type ClientType =
  | "auth"
  | "products"
  | "partners"
  | "quotes"
  | "salesOrders"
  | "purchaseOrders"
  | "financialAccounts"
  | "accountsPayable"
  | "accountsReceivable"
  | "stock"
  | "taxes"
  | "nfe"
  | "paymentTerms"
  | "apiKeys";

/**
 * SDK Client Manager
 * Provides hooks and utilities for accessing SDK clients
 */
export class SdkClientManager {
  /**
   * Initialize the SDK client factory
   * Should be called once at app startup
   */
  static initialize(baseUrl: string, tokenGetter: () => string | null): void {
    SdkClientFactory.initialize(baseUrl, tokenGetter);
  }

  /**
   * Get a client instance by type
   */
  static getClient<T>(type: ClientType): T {
    switch (type) {
      case "auth":
        return SdkClientFactory.getAuthClient() as T;
      case "products":
        return SdkClientFactory.getProductsClient() as T;
      case "partners":
        return SdkClientFactory.getPartnersClient() as T;
      case "quotes":
        return SdkClientFactory.getQuotesClient() as T;
      case "salesOrders":
        return SdkClientFactory.getSalesOrdersClient() as T;
      case "purchaseOrders":
        return SdkClientFactory.getPurchaseOrdersClient() as T;
      case "financialAccounts":
        return SdkClientFactory.getFinancialAccountsClient() as T;
      case "accountsPayable":
        return SdkClientFactory.getAccountsPayableClient() as T;
      case "accountsReceivable":
        return SdkClientFactory.getAccountsReceivableClient() as T;
      case "stock":
        return SdkClientFactory.getStockClient() as T;
      case "taxes":
        return SdkClientFactory.getTaxesClient() as T;
      case "nfe":
        return SdkClientFactory.getNfeClient() as T;
      case "paymentTerms":
        return SdkClientFactory.getPaymentTermsClient() as T;
      case "apiKeys":
        return SdkClientFactory.getApiKeysClient() as T;
      default:
        throw new Error(`Unknown client type: ${type}`);
    }
  }

  /**
   * Clear all clients (useful for logout)
   */
  static clearAll(): void {
    SdkClientFactory.clearClients();
  }

  /**
   * Clear a specific client (useful for token refresh)
   */
  static clearClient(type: ClientType): void {
    SdkClientFactory.clearClient(type);
  }
}

/**
 * Hook to get an SDK client instance
 * Automatically handles client recreation when token changes
 */
export function useSdkClient<T>(type: ClientType): T {
  // Get token from localStorage (client-side only)
  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("fenix_token");
  }, []);

  // Recreate client when token changes
  useEffect(() => {
    // Clear the specific client to force recreation with new token
    SdkClientManager.clearClient(type);
  }, [token, type]);

  return useMemo(() => {
    try {
      return SdkClientManager.getClient<T>(type);
    } catch (error) {
      // If token is missing, return a mock client that throws helpful errors
      if (SdkErrorHandler.isAuthError(error)) {
        throw new Error("Authentication required. Please log in.");
      }
      throw error;
    }
  }, [type, token]);
}

/**
 * Hook to get multiple SDK clients
 */
export function useSdkClients<T extends Record<string, ClientType>>(
  types: T
): { [K in keyof T]: ReturnType<typeof useSdkClient> } {
  const clients = {} as { [K in keyof T]: ReturnType<typeof useSdkClient> };

  for (const [key, type] of Object.entries(types) as [keyof T, ClientType][]) {
    clients[key] = useSdkClient(type);
  }

  return clients;
}
