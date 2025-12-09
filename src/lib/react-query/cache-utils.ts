import { QueryClient, type QueryKey } from "@tanstack/react-query";

/**
 * Cache manipulation utilities for React Query
 *
 * These utilities provide a consistent way to invalidate and update cache
 * across the application.
 */

/**
 * Entity types supported by cache utilities
 */
export type EntityType =
  | "product"
  | "products"
  | "partner"
  | "partners"
  | "purchase-order"
  | "purchase-orders"
  | "sales-order"
  | "sales-orders"
  | "quote"
  | "quotes";

/**
 * Invalidate all queries for a specific entity list
 *
 * @example
 * ```tsx
 * import { useQueryClient } from "@tanstack/react-query";
 * import { invalidateEntityList } from "@/lib/react-query/cache-utils";
 *
 * function MyComponent() {
 *   const queryClient = useQueryClient();
 *
 *   const handleRefresh = () => {
 *     invalidateEntityList(queryClient, "products");
 *   };
 * }
 * ```
 */
export function invalidateEntityList(
  queryClient: QueryClient,
  entityType: EntityType
): Promise<void> {
  const queryKey = getListQueryKey(entityType);
  return queryClient.invalidateQueries({ queryKey });
}

/**
 * Invalidate a specific entity by ID
 *
 * @example
 * ```tsx
 * import { useQueryClient } from "@tanstack/react-query";
 * import { invalidateEntity } from "@/lib/react-query/cache-utils";
 *
 * function MyComponent() {
 *   const queryClient = useQueryClient();
 *
 *   const handleRefresh = (productId: string) => {
 *     invalidateEntity(queryClient, "product", productId);
 *   };
 * }
 * ```
 */
export function invalidateEntity(
  queryClient: QueryClient,
  entityType: EntityType,
  id: string
): Promise<void> {
  const queryKey = getEntityQueryKey(entityType, id);
  return queryClient.invalidateQueries({ queryKey });
}

/**
 * Update entity cache directly without refetching
 * Use this when you have the updated data and want to update cache immediately
 *
 * @example
 * ```tsx
 * import { useQueryClient } from "@tanstack/react-query";
 * import { updateEntityCache } from "@/lib/react-query/cache-utils";
 *
 * function MyComponent() {
 *   const queryClient = useQueryClient();
 *
 *   const handleUpdate = (productId: string, updatedData: Product) => {
 *     updateEntityCache(queryClient, "product", productId, updatedData);
 *   };
 * }
 * ```
 */
export function updateEntityCache<T>(
  queryClient: QueryClient,
  entityType: EntityType,
  id: string,
  updater: T | ((old: T | undefined) => T)
): void {
  const queryKey = getEntityQueryKey(entityType, id);
  queryClient.setQueryData<T>(queryKey, updater);
}

/**
 * Update entity list cache
 * Use this to update a list cache (e.g., add/remove items)
 *
 * @example
 * ```tsx
 * import { useQueryClient } from "@tanstack/react-query";
 * import { updateEntityListCache } from "@/lib/react-query/cache-utils";
 *
 * function MyComponent() {
 *   const queryClient = useQueryClient();
 *
 *   const handleAddProduct = (newProduct: Product) => {
 *     updateEntityListCache(queryClient, "products", (old) => {
 *       if (!old?.data) return old;
 *       return {
 *         ...old,
 *         data: [...old.data, newProduct],
 *       };
 *     });
 *   };
 * }
 * ```
 */
export function updateEntityListCache<T>(
  queryClient: QueryClient,
  entityType: EntityType,
  updater: (old: T | undefined) => T
): void {
  const queryKey = getListQueryKey(entityType);
  queryClient.setQueryData<T>(queryKey, updater);
}

/**
 * Remove entity from cache
 * Use this when an entity is deleted
 *
 * @example
 * ```tsx
 * import { useQueryClient } from "@tanstack/react-query";
 * import { removeEntityFromCache } from "@/lib/react-query/cache-utils";
 *
 * function MyComponent() {
 *   const queryClient = useQueryClient();
 *
 *   const handleDelete = (productId: string) => {
 *     removeEntityFromCache(queryClient, "product", productId);
 *     invalidateEntityList(queryClient, "products");
 *   };
 * }
 * ```
 */
export function removeEntityFromCache(
  queryClient: QueryClient,
  entityType: EntityType,
  id: string
): void {
  const queryKey = getEntityQueryKey(entityType, id);
  queryClient.removeQueries({ queryKey });
}

/**
 * Get entity from cache without triggering a fetch
 *
 * @example
 * ```tsx
 * import { useQueryClient } from "@tanstack/react-query";
 * import { getEntityFromCache } from "@/lib/react-query/cache-utils";
 *
 * function MyComponent() {
 *   const queryClient = useQueryClient();
 *
 *   const product = getEntityFromCache<Product>(queryClient, "product", productId);
 * }
 * ```
 */
export function getEntityFromCache<T>(
  queryClient: QueryClient,
  entityType: EntityType,
  id: string
): T | undefined {
  const queryKey = getEntityQueryKey(entityType, id);
  return queryClient.getQueryData<T>(queryKey);
}

/**
 * Get entity list from cache without triggering a fetch
 *
 * @example
 * ```tsx
 * import { useQueryClient } from "@tanstack/react-query";
 * import { getEntityListFromCache } from "@/lib/react-query/cache-utils";
 *
 * function MyComponent() {
 *   const queryClient = useQueryClient();
 *
 *   const products = getEntityListFromCache<PaginatedResponse<Product>>(
 *     queryClient,
 *     "products"
 *   );
 * }
 * ```
 */
export function getEntityListFromCache<T>(
  queryClient: QueryClient,
  entityType: EntityType
): T | undefined {
  const queryKey = getListQueryKey(entityType);
  return queryClient.getQueryData<T>(queryKey);
}

/**
 * Helper function to get query key for entity list
 */
function getListQueryKey(entityType: EntityType): QueryKey {
  // Normalize entity type to plural form
  const normalizedType = entityType.endsWith("s")
    ? entityType
    : `${entityType}s`;

  // Handle special cases
  const keyMap: Record<string, string> = {
    "purchase-orders": "purchase-orders",
    "sales-orders": "sales-orders",
    products: "products",
    partners: "partners",
    quotes: "quotes",
  };

  return [keyMap[normalizedType] || normalizedType];
}

/**
 * Helper function to get query key for single entity
 */
function getEntityQueryKey(entityType: EntityType, id: string): QueryKey {
  // Normalize entity type to singular form
  const normalizedType = entityType.endsWith("s")
    ? entityType.slice(0, -1)
    : entityType;

  // Handle special cases
  const keyMap: Record<string, string> = {
    "purchase-order": "purchase-order",
    "sales-order": "sales-order",
    product: "product",
    partner: "partner",
    quote: "quote",
  };

  return [keyMap[normalizedType] || normalizedType, id];
}

/**
 * When to use setQueryData vs invalidateQueries:
 *
 * Use `setQueryData` (updateEntityCache) when:
 * - You have the updated data and want to update cache immediately
 * - You're doing optimistic updates
 * - You want to avoid a refetch (e.g., after a mutation that returns the updated data)
 *
 * Use `invalidateQueries` (invalidateEntity) when:
 * - You want to mark data as stale and trigger a refetch
 * - You don't have the updated data
 * - You want to ensure data is fresh from the server
 * - After mutations that don't return the full updated entity
 */

