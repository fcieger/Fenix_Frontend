import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import {
  listQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
  recalculateTaxes,
} from "@/services/quotes-service";
import type {
  Quote,
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteStatus,
  PaginatedResponse,
} from "@/types/sdk";

export type QuotesQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuoteStatus;
  partnerId?: string;
};

/**
 * Query options for quotes list
 * Reutilizável e com melhor tipagem
 */
export const quotesQueryOptions = (params?: QuotesQueryParams) =>
  queryOptions({
    queryKey: ["quotes", params],
    queryFn: () => listQuotes(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

/**
 * Query options for a single quote
 * Reutilizável e com melhor tipagem
 */
export const quoteQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["quote", id],
    queryFn: () => getQuote(id),
  });

/**
 * Hook to fetch list of quotes
 */
export const useQuotes = (params?: QuotesQueryParams) => {
  return useQuery(quotesQueryOptions(params));
};

/**
 * Hook to fetch a single quote by ID
 */
export const useQuote = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    ...quoteQueryOptions(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

/**
 * Hook to create a new quote
 */
export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuoteDto) => createQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};

/**
 * Hook to update an existing quote
 */
export const useUpdateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuoteDto }) =>
      updateQuote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({
        queryKey: ["quote", variables.id],
      });
    },
  });
};

/**
 * Hook to delete a quote
 */
export const useDeleteQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};

/**
 * Hook to recalculate taxes for a quote
 */
export const useRecalculateQuoteTaxes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recalculateTaxes(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["quote", id],
      });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};
