import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { CrudService } from "../services/crud";

/**
 * Build a typed set of React Query hooks (list/detail/create/update/remove)
 * for any service produced by `createCrudService`.
 */
export function createCrudHooks<T, ID extends string | number = string>(
  key: string,
  service: CrudService<T, ID>,
) {
  const listKey = (params?: Record<string, unknown>) =>
    params ? [key, "list", params] : [key, "list"];
  const detailKey = (id: ID) => [key, "detail", id];

  function useList(
    params?: Record<string, unknown>,
    options?: Omit<UseQueryOptions<T[]>, "queryKey" | "queryFn">,
  ) {
    return useQuery<T[]>({
      queryKey: listKey(params),
      queryFn: () => service.list(params),
      ...options,
    });
  }

  function useDetail(
    id: ID | undefined,
    options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
  ) {
    return useQuery<T>({
      queryKey: detailKey(id as ID),
      queryFn: () => service.retrieve(id as ID),
      enabled: id !== undefined && id !== null && (options?.enabled ?? true),
      ...options,
    });
  }

  function useCreate(
    options?: UseMutationOptions<T, unknown, Partial<T>>,
  ) {
    const qc = useQueryClient();
    return useMutation<T, unknown, Partial<T>>({
      mutationFn: (payload) => service.create(payload),
      onSuccess: (...args) => {
        qc.invalidateQueries({ queryKey: [key] });
        (options?.onSuccess as any)?.(...args);
      },
      ...options,
    });
  }

  function useUpdate(
    options?: UseMutationOptions<T, unknown, { id: ID; data: Partial<T> }>,
  ) {
    const qc = useQueryClient();
    return useMutation<T, unknown, { id: ID; data: Partial<T> }>({
      mutationFn: ({ id, data }) => service.update(id, data),
      onSuccess: (...args) => {
        qc.invalidateQueries({ queryKey: [key] });
        qc.invalidateQueries({ queryKey: detailKey(args[1].id) });
        (options?.onSuccess as any)?.(...args);
      },
      ...options,
    });
  }

  function useRemove(options?: UseMutationOptions<void, unknown, ID>) {
    const qc = useQueryClient();
    return useMutation<void, unknown, ID>({
      mutationFn: (id) => service.remove(id),
      onSuccess: (...args) => {
        qc.invalidateQueries({ queryKey: [key] });
        qc.removeQueries({ queryKey: detailKey(args[1]) });
        (options?.onSuccess as any)?.(...args);
      },
      ...options,
    });
  }

  return { keys: { all: [key], list: listKey, detail: detailKey }, useList, useDetail, useCreate, useUpdate, useRemove };
}
