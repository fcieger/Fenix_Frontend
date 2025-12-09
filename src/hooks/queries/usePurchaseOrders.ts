import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import {
  listPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  recalculateTaxes,
} from "@/services/purchase-orders-service";
import type {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderStatus,
  PaginatedResponse,
} from "@/types/sdk";

export type PurchaseOrdersQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: PurchaseOrderStatus;
  partnerId?: string;
};

/**
 * Query options for purchase orders list
 * Reutilizável e com melhor tipagem
 */
export const purchaseOrdersQueryOptions = (params?: PurchaseOrdersQueryParams) =>
  queryOptions({
    queryKey: ["purchase-orders", params],
    queryFn: () => listPurchaseOrders(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

/**
 * Query options for a single purchase order
 * Reutilizável e com melhor tipagem
 */
export const purchaseOrderQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["purchase-order", id],
    queryFn: () => getPurchaseOrder(id),
  });

/**
 * Hook to fetch list of purchase orders
 */
export const usePurchaseOrders = (params?: PurchaseOrdersQueryParams) => {
  return useQuery(purchaseOrdersQueryOptions(params));
};

/**
 * Hook to fetch a single purchase order by ID
 */
export const usePurchaseOrder = (
  id: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    ...purchaseOrderQueryOptions(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

/**
 * Hook to create a new purchase order
 */
export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderDto) => createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

/**
 * Hook to update an existing purchase order
 */
export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePurchaseOrderDto;
    }) => updatePurchaseOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["purchase-order", variables.id],
      });
    },
  });
};

/**
 * Hook to delete a purchase order
 */
export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

/**
 * Hook to recalculate taxes for a purchase order
 */
export const useRecalculatePurchaseOrderTaxes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recalculateTaxes(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["purchase-order", id],
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

