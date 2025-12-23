import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";

/**
 * Options for optimistic mutations
 */
export interface OptimisticMutationOptions<TData, TVariables, TContext> {
  /**
   * Function to get the current data from cache for rollback
   */
  getCurrentData: (variables: TVariables) => TContext | undefined;
  /**
   * Function to apply optimistic update to cache
   */
  applyOptimisticUpdate: (
    currentData: TContext | undefined,
    variables: TVariables
  ) => TContext;
  /**
   * Query keys to invalidate on success
   */
  invalidateQueries?: Array<string | string[]>;
  /**
   * Query keys to invalidate on error (rollback)
   */
  invalidateOnError?: Array<string | string[]>;
}

/**
 * Generic hook for optimistic updates
 *
 * This hook provides a type-safe way to implement optimistic updates
 * with automatic rollback on error.
 *
 * @example
 * ```tsx
 * import { useOptimisticMutation } from "@/lib/react-query/optimistic-updates";
 * import { useUpdateProduct } from "@/hooks/queries/useProducts";
 * import { updateProduct } from "@/services/products-service";
 *
 * function useOptimisticUpdateProduct() {
 *   const queryClient = useQueryClient();
 *
 *   return useOptimisticMutation({
 *     mutationFn: ({ id, data }) => updateProduct(id, data),
 *     getCurrentData: ({ id }) => {
 *       return queryClient.getQueryData(["product", id]);
 *     },
 *     applyOptimisticUpdate: (current, { id, data }) => {
 *       return current ? { ...current, ...data } : current;
 *     },
 *     invalidateQueries: [["products"], ["product"]],
 *   });
 * }
 * ```
 */
export function useOptimisticMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: OptimisticMutationOptions<TData, TVariables, TContext> & {
    getQueryKey: (variables: TVariables) => string[];
  },
  mutationOptions?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn"
  >
): UseMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient();
  const {
    getQueryKey,
    getCurrentData,
    applyOptimisticUpdate,
    invalidateQueries = [],
    invalidateOnError = [],
  } = options;

  return useMutation({
    ...mutationOptions,
    mutationFn,
    onMutate: async (variables) => {
      const queryKey = getQueryKey(variables);
      const currentData = getCurrentData(variables);
      const optimisticData = applyOptimisticUpdate(currentData, variables);

      // Update cache optimistically
      if (optimisticData !== undefined) {
        queryClient.setQueryData(queryKey, optimisticData);
      }

      // Return context for potential rollback
      return currentData as TContext;
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      const queryKey = getQueryKey(variables);
      if (context !== undefined) {
        queryClient.setQueryData(queryKey, context);
      }

      // Invalidate queries on error
      invalidateOnError.forEach((key) => {
        const queryKeyValue = Array.isArray(key) ? key : [key];
        queryClient.invalidateQueries({ queryKey: queryKeyValue });
      });

      // Call custom onError if provided
      if (mutationOptions?.onError) {
        mutationOptions.onError(error, variables, context, undefined as any);
      }
    },
    onSettled: (data, error, variables, context) => {
      // Invalidate queries on success
      if (!error) {
        invalidateQueries.forEach((key) => {
          const queryKeyValue = Array.isArray(key) ? key : [key];
          queryClient.invalidateQueries({ queryKey: queryKeyValue });
        });
      }

      // Call custom onSettled if provided
      if (mutationOptions?.onSettled) {
        mutationOptions.onSettled(
          data,
          error,
          variables,
          context,
          undefined as any
        );
      }
    },
  });
}
