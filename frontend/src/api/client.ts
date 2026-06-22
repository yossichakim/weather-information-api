import { createResponseError, normalizeApiError } from "./errors";
import { session } from "./session";
import type { ErrorResponse } from "../types/api";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/$/, "");

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  authenticated?: boolean;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return undefined;
  return response.json();
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.authenticated) {
    const token = session.getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body:
        options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
    });
    const body = await parseBody(response);

    if (!response.ok) {
      if (response.status === 401 && options.authenticated) {
        session.clear();
        unauthorizedHandler?.();
      }
      const errorBody = body as Partial<ErrorResponse> | undefined;
      throw createResponseError(response.status, errorBody?.message);
    }

    return body as T;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
