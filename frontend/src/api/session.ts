const ACCESS_TOKEN_KEY = "weather-operations-access-token";

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
