import { apiRequest } from "./client";
import type { LoginResponse, UserResponse } from "../types/api";

export interface Credentials {
  email: string;
  password: string;
}

/**
 * Creates an account without creating a local authenticated session.
 */
export function register(credentials: Credentials): Promise<UserResponse> {
  return apiRequest("/auth/register", {
    method: "POST",
    body: credentials,
  });
}

/**
 * Exchanges credentials for the user record and bearer token persisted by the
 * authentication context.
 */
export function login(credentials: Credentials): Promise<LoginResponse> {
  return apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

/**
 * Resolves the identity associated with the stored bearer token.
 */
export function getCurrentUser(): Promise<UserResponse> {
  return apiRequest("/auth/me", { authenticated: true });
}

/**
 * Revokes the current bearer token on the backend.
 */
export function logout(): Promise<void> {
  return apiRequest("/auth/logout", {
    method: "DELETE",
    authenticated: true,
  });
}
