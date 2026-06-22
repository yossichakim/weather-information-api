import { apiRequest } from "./client";
import type { LoginResponse, UserResponse } from "../types/api";

export interface Credentials {
  email: string;
  password: string;
}

export function register(credentials: Credentials): Promise<UserResponse> {
  return apiRequest("/auth/register", {
    method: "POST",
    body: credentials,
  });
}

export function login(credentials: Credentials): Promise<LoginResponse> {
  return apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function getCurrentUser(): Promise<UserResponse> {
  return apiRequest("/auth/me", { authenticated: true });
}

export function logout(): Promise<void> {
  return apiRequest("/auth/logout", {
    method: "DELETE",
    authenticated: true,
  });
}
