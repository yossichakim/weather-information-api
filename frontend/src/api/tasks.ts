import { apiRequest } from "./client";
import type {
  CreateTaskInput,
  TaskApiStatus,
  TaskFilters,
  TaskInputStatus,
  TaskListResponse,
  TaskResponse,
  UpdateTaskInput,
} from "../types/api";

/**
 * Maps the uppercase response enum to the lowercase value accepted by task
 * mutation and filter requests.
 */
export function toInputStatus(status: TaskApiStatus): TaskInputStatus {
  return status === "CHECKED" ? "checked" : "pending";
}

/**
 * Lists the authenticated user's tasks with optional server-side filters.
 */
export function listTasks(filters: TaskFilters): Promise<TaskListResponse> {
  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.category?.trim()) {
    query.set("category", filters.category.trim());
  }
  const suffix = query.size ? `?${query.toString()}` : "";
  return apiRequest(`/tasks${suffix}`, { authenticated: true });
}

/**
 * Creates a task through the authenticated task collection endpoint.
 */
export function createTask(input: CreateTaskInput): Promise<TaskResponse> {
  return apiRequest("/tasks", {
    method: "POST",
    authenticated: true,
    body: input,
  });
}

/**
 * Retrieves one task through the backend's ownership-scoped endpoint.
 */
export function getTask(id: number): Promise<TaskResponse> {
  return apiRequest(`/tasks/${id}`, { authenticated: true });
}

/**
 * Applies a partial update to a task owned by the authenticated user.
 */
export function updateTask(
  id: number,
  input: UpdateTaskInput,
): Promise<TaskResponse> {
  return apiRequest(`/tasks/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: input,
  });
}

/**
 * Deletes an owned task and resolves without a response body.
 */
export function deleteTask(id: number): Promise<void> {
  return apiRequest(`/tasks/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}
