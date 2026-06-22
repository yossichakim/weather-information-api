import { createContext, useContext } from "react";
import type { User } from "../../types/api";

export type SessionStatus = "restoring" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: User | null;
  status: SessionStatus;
  message: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  clearMessage: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
