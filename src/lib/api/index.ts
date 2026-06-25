/**
 * Backend API surface for the Django REST Framework integration.
 *
 * Usage in components / routes:
 *
 *   import { departmentsHooks } from "@/lib/api";
 *
 *   const { data: departments = [], isLoading } = departmentsHooks.useList();
 *   const create = departmentsHooks.useCreate();
 *   create.mutate({ name: "Civil", hod: "..." });
 *
 * Lower-level service calls (outside React) are available as e.g.
 * `departmentsService.list()` from "@/lib/api".
 */

export * from "./client";
export * from "./types";
export * from "./services";
export { authService } from "./services/auth";
export * from "./hooks";
