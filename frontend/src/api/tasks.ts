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

export function toInputStatus(status: TaskApiStatus): TaskInputStatus {
  return status === "CHECKED" ? "checked" : "pending";
}

export function listTasks(filters: TaskFilters): Promise<TaskListResponse> {
  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.category?.trim()) {
    query.set("category", filters.category.trim());
  }
  const suffix = query.size ? `?${query.toString()}` : "";
  return apiRequest(`/tasks${suffix}`, { authenticated: true });
}

export function createTask(input: CreateTaskInput): Promise<TaskResponse> {
  return apiRequest("/tasks", {
    method: "POST",
    authenticated: true,
    body: input,
  });
}

export function getTask(id: number): Promise<TaskResponse> {
  return apiRequest(`/tasks/${id}`, { authenticated: true });
}

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

export function deleteTask(id: number): Promise<void> {
  return apiRequest(`/tasks/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}
