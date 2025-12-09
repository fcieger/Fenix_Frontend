import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/products-service";
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  PaginatedResponse,
} from "@/types/sdk";

export type ProductsQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

/**
 * Query options for products list
 * Reutilizável e com melhor tipagem
 */
export const productsQueryOptions = (params?: ProductsQueryParams) =>
  queryOptions({
    queryKey: ["products", params],
    queryFn: () => listProducts(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

/**
 * Query options for a single product
 * Reutilizável e com melhor tipagem
 */
export const productQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });

/**
 * Hook to fetch list of products
 */
export const useProducts = (params?: ProductsQueryParams) => {
  return useQuery(productsQueryOptions(params));
};

/**
 * Hook to fetch a single product by ID
 */
export const useProduct = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    ...productQueryOptions(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

/**
 * Hook to create a new product
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

/**
 * Hook to update an existing product
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });
};

/**
 * Hook to delete a product
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

