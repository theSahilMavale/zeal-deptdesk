import { apiClient, unwrapList, type Paginated } from "../client";

/**
 * Generic CRUD factory for a Django REST Framework ModelViewSet endpoint.
 * Conventional URL shape:
 *   GET    /{resource}/         list
 *   POST   /{resource}/         create
 *   GET    /{resource}/:id/     retrieve
 *   PATCH  /{resource}/:id/     update (partial)
 *   PUT    /{resource}/:id/     update (full)
 *   DELETE /{resource}/:id/     destroy
 */
export function createCrudService<T, ID extends string | number = string>(resource: string) {
  const base = `/${resource.replace(/^\/+|\/+$/g, "")}/`;
  return {
    base,
    async list(params?: Record<string, unknown>): Promise<T[]> {
      const { data } = await apiClient.get<Paginated<T> | T[]>(base, { params });
      return unwrapList<T>(data);
    },
    async listRaw(params?: Record<string, unknown>): Promise<Paginated<T> | T[]> {
      const { data } = await apiClient.get<Paginated<T> | T[]>(base, { params });
      return data;
    },
    async retrieve(id: ID): Promise<T> {
      const { data } = await apiClient.get<T>(`${base}${id}/`);
      return data;
    },
    async create(payload: Partial<T>): Promise<T> {
      const { data } = await apiClient.post<T>(base, payload);
      return data;
    },
    async update(id: ID, payload: Partial<T>): Promise<T> {
      const { data } = await apiClient.patch<T>(`${base}${id}/`, payload);
      return data;
    },
    async replace(id: ID, payload: T): Promise<T> {
      const { data } = await apiClient.put<T>(`${base}${id}/`, payload);
      return data;
    },
    async remove(id: ID): Promise<void> {
      await apiClient.delete(`${base}${id}/`);
    },
  };
}

export type CrudService<T, ID extends string | number = string> = ReturnType<
  typeof createCrudService<T, ID>
>;
