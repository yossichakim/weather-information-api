import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authApi from "../../api/auth";
import { setUnauthorizedHandler } from "../../api/client";
import { normalizeApiError } from "../../api/errors";
import { session } from "../../api/session";
import type { User } from "../../types/api";
import { AuthContext, type SessionStatus } from "./auth-state";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>("restoring");
  const [message, setMessage] = useState<string | null>(null);

  const clearLocalSession = useCallback(() => {
    session.clear();
    setUser(null);
    setStatus("unauthenticated");
    setMessage("Your session ended. Sign in again to continue with tasks.");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearLocalSession);
    return () => setUnauthorizedHandler(null);
  }, [clearLocalSession]);

  useEffect(() => {
    const token = session.getToken();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    authApi
      .getCurrentUser()
      .then((response) => {
        setUser(response.data.user);
        setStatus("authenticated");
      })
      .catch(() => {
        session.clear();
        setUser(null);
        setStatus("unauthenticated");
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    session.setToken(response.data.accessToken);
    setUser(response.data.user);
    setStatus("authenticated");
    setMessage(`Welcome back, ${response.data.user.email}.`);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const response = await authApi.register({ email, password });
    setMessage("Account created. Sign in to open your task workspace.");
    return response.data.user;
  }, []);

  const logout = useCallback(async () => {
    let logoutMessage = "You have been signed out.";
    try {
      await authApi.logout();
    } catch (error) {
      const normalized = normalizeApiError(error);
      logoutMessage =
        normalized.kind === "authentication"
          ? "Your session was already inactive. Local session data was cleared."
          : "The server could not confirm logout. Local session data was cleared.";
    } finally {
      session.clear();
      setUser(null);
      setStatus("unauthenticated");
      setMessage(logoutMessage);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      message,
      login,
      register,
      logout,
      clearMessage: () => setMessage(null),
    }),
    [user, status, message, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
