import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

interface OptimisticMutationOptions<TData, TVariables> {
  /** The query key(s) to invalidate on success */
  queryKey: QueryKey | QueryKey[];
  /** The actual mutation function */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Apply optimistic update to the cached data before the mutation resolves */
  onOptimisticUpdate: (old: any, variables: TVariables) => any;
  /** Success callback */
  onSuccess?: (data: TData, variables: TVariables) => void;
  /** Error callback */
  onError?: (error: Error, variables: TVariables) => void;
}

/**
 * Wrapper around useMutation that automatically handles optimistic updates.
 * The cache is updated immediately with `onOptimisticUpdate`,
 * then rolled back on error, and refetched on success.
 */
export function useOptimisticMutation<TData = any, TVariables = any>({
  queryKey,
  mutationFn,
  onOptimisticUpdate,
  onSuccess,
  onError,
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const queryKeys = Array.isArray(queryKey[0]) ? queryKey as QueryKey[] : [queryKey as QueryKey];

  return useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches
      await Promise.all(
        queryKeys.map((key) => queryClient.cancelQueries({ queryKey: key })),
      );

      // Snapshot previous values
      const previousData = queryKeys.map((key) => ({
        key,
        data: queryClient.getQueryData(key),
      }));

      // Optimistically update
      queryKeys.forEach((key) => {
        queryClient.setQueryData(key, (old: any) => {
          if (!old) return old;
          return onOptimisticUpdate(old, variables);
        });
      });

      return { previousData };
    },
    onError: (error: Error, _variables: TVariables, context: any) => {
      // Rollback
      if (context?.previousData) {
        context.previousData.forEach(({ key, data }: { key: QueryKey; data: any }) => {
          queryClient.setQueryData(key, data);
        });
      }
      onError?.(error, _variables);
    },
    onSuccess: (data: TData, variables: TVariables) => {
      // Invalidate to get fresh data from server
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      onSuccess?.(data, variables);
    },
  });
}
