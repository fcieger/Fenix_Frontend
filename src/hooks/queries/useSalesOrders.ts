import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import {
  listSalesOrders,
  getSalesOrder,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  recalculateTaxes,
} from "@/services/sales-orders-service";
import type {
  SalesOrder,
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  SalesOrderStatus,
  PaginatedResponse,
} from "@/types/sdk";

export type SalesOrdersQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: SalesOrderStatus;
  partnerId?: string;
};

/**
 * Query options for sales orders list
 * Reutilizável e com melhor tipagem
 */
export const salesOrdersQueryOptions = (params?: SalesOrdersQueryParams) =>
  queryOptions({
    queryKey: ["sales-orders", params],
    queryFn: () => listSalesOrders(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

/**
 * Query options for a single sales order
 * Reutilizável e com melhor tipagem
 */
export const salesOrderQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["sales-order", id],
    queryFn: () => getSalesOrder(id),
  });

/**
 * Hook to fetch list of sales orders
 */
export const useSalesOrders = (params?: SalesOrdersQueryParams) => {
  return useQuery(salesOrdersQueryOptions(params));
};

/**
 * Hook to fetch a single sales order by ID
 */
export const useSalesOrder = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    ...salesOrderQueryOptions(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

/**
 * Hook to create a new sales order
 */
export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesOrderDto) => createSalesOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
    },
  });
};

/**
 * Hook to update an existing sales order
 */
export const useUpdateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalesOrderDto }) =>
      updateSalesOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["sales-order", variables.id],
      });
    },
  });
};

/**
 * Hook to delete a sales order
 */
export const useDeleteSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSalesOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
    },
  });
};

/**
 * Hook to recalculate taxes for a sales order
 */
export const useRecalculateSalesOrderTaxes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recalculateTaxes(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["sales-order", id],
      });
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
    },
  });
};
