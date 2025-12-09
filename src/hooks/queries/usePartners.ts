import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import {
  listPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
} from "@/services/partners-service";
import type {
  Partner,
  CreatePartnerDto,
  UpdatePartnerDto,
  PartnerQueryParams,
  PaginatedResponse,
} from "@/types/sdk";

/**
 * Query options for partners list
 * Reutilizável e com melhor tipagem
 */
export const partnersQueryOptions = (params?: PartnerQueryParams) =>
  queryOptions({
    queryKey: ["partners", params],
    queryFn: () => listPartners(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

/**
 * Query options for a single partner
 * Reutilizável e com melhor tipagem
 */
export const partnerQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["partner", id],
    queryFn: () => getPartner(id),
  });

/**
 * Hook to fetch list of partners
 */
export const usePartners = (params?: PartnerQueryParams) => {
  return useQuery(partnersQueryOptions(params));
};

/**
 * Hook to fetch a single partner by ID
 */
export const usePartner = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    ...partnerQueryOptions(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

/**
 * Hook to create a new partner
 */
export const useCreatePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePartnerDto) => createPartner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
};

/**
 * Hook to update an existing partner
 */
export const useUpdatePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerDto }) =>
      updatePartner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["partner", variables.id] });
    },
  });
};

/**
 * Hook to delete a partner
 */
export const useDeletePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
};

