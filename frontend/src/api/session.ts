const ACCESS_TOKEN_KEY = "weather-operations-access-token";

/**
 * Centralizes access-token persistence so authentication state and the API
 * client share one storage key and one clearing path.
 */
export const session = {
  getToken(): string | null {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setToken(token: string): void {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear(): void {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
