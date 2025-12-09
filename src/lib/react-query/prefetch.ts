import { QueryClient } from "@tanstack/react-query";
import { getProduct } from "@/services/products-service";
import { getPartner } from "@/services/partners-service";
import { getPurchaseOrder } from "@/services/purchase-orders-service";

/**
 * Prefetch utilities for React Query
 * Use these to prefetch data before navigation or on hover
 */

/**
 * Generic prefetch function for entities
 * @param queryClient - The QueryClient instance
 * @param entityType - The entity type (e.g., "product", "partner", "purchase-order")
 * @param id - The entity ID
 * @param queryFn - The function to fetch the entity
 */
export async function prefetchEntity<T>(
  queryClient: QueryClient,
  entityType: string,
  id: string,
  queryFn: () => Promise<T>
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: [entityType, id],
    queryFn,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Prefetch a product by ID
 * Use this when hovering over product links or before navigating to product details
 *
 * @example
 * ```tsx
 * import { useQueryClient } from "@tanstack/react-query";
 * import { prefetchProduct } from "@/lib/react-query/prefetch";
 *
 * function ProductLink({ id }: { id: string }) {
 *   const queryClient = useQueryClient();
 *
 *   return (
 *     <Link
 *       href={`/products/${id}`}
 *       onMouseEnter={() => prefetchProduct(queryClient, id)}
 *     >
 *       View Product
 *     </Link>
 *   );
 * }
 * ```
 */
export async function prefetchProduct(
  queryClient: QueryClient,
  id: string
): Promise<void> {
  await prefetchEntity(queryClient, "product", id, () => getProduct(id));
}

/**
 * Prefetch a partner by ID
 * Use this when hovering over partner links or before navigating to partner details
 *
 * @example
 * ```tsx
 * import { useQueryClient } from "@tanstack/react-query";
 * import { prefetchPartner } from "@/lib/react-query/prefetch";
 *
 * function PartnerLink({ id }: { id: string }) {
 *   const queryClient = useQueryClient();
 *
 *   return (
 *     <Link
 *       href={`/partners/${id}`}
 *       onMouseEnter={() => prefetchPartner(queryClient, id)}
 *     >
 *       View Partner
 *     </Link>
 *   );
 * }
 * ```
 */
export async function prefetchPartner(
  queryClient: QueryClient,
  id: string
): Promise<void> {
  await prefetchEntity(queryClient, "partner", id, () => getPartner(id));
}

/**
 * Prefetch a purchase order by ID
 * Use this when hovering over order links or before navigating to order details
 *
 * @example
 * ```tsx
 * import { useQueryClient } from "@tanstack/react-query";
 * import { prefetchPurchaseOrder } from "@/lib/react-query/prefetch";
 *
 * function OrderLink({ id }: { id: string }) {
 *   const queryClient = useQueryClient();
 *
 *   return (
 *     <Link
 *       href={`/purchases/${id}`}
 *       onMouseEnter={() => prefetchPurchaseOrder(queryClient, id)}
 *     >
 *       View Order
 *     </Link>
 *   );
 * }
 * ```
 */
export async function prefetchPurchaseOrder(
  queryClient: QueryClient,
  id: string
): Promise<void> {
  await prefetchEntity(queryClient, "purchase-order", id, () =>
    getPurchaseOrder(id)
  );
}

/**
 * Prefetch multiple entities of the same type
 * Useful for prefetching a list of items that will likely be viewed
 *
 * @example
 * ```tsx
 * import { useQueryClient } from "@tanstack/react-query";
 * import { prefetchProducts } from "@/lib/react-query/prefetch";
 *
 * // Prefetch first 10 products when page loads
 * useEffect(() => {
 *   const productIds = products.slice(0, 10).map(p => p.id);
 *   prefetchProducts(queryClient, productIds);
 * }, []);
 * ```
 */
export async function prefetchProducts(
  queryClient: QueryClient,
  ids: string[]
): Promise<void> {
  await Promise.all(
    ids.map((id) => prefetchProduct(queryClient, id))
  );
}

export async function prefetchPartners(
  queryClient: QueryClient,
  ids: string[]
): Promise<void> {
  await Promise.all(
    ids.map((id) => prefetchPartner(queryClient, id))
  );
}

export async function prefetchPurchaseOrders(
  queryClient: QueryClient,
  ids: string[]
): Promise<void> {
  await Promise.all(
    ids.map((id) => prefetchPurchaseOrder(queryClient, id))
  );
}

