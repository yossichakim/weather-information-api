export type ApiErrorKind =
  | "validation"
  | "authentication"
  | "not-found"
  | "provider"
  | "server"
  | "network"
  | "unknown";

export class ApiError extends Error {
  readonly status: number | null;
  readonly kind: ApiErrorKind;

  constructor(message: string, status: number | null, kind: ApiErrorKind) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;
  }
}

function kindForStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 409) return "validation";
  if (status === 401 || status === 403) return "authentication";
  if (status === 404) return "not-found";
  if (status === 502) return "provider";
  if (status >= 500) return "server";
  return "unknown";
}

export function normalizeApiError(
  error: unknown,
  fallback = "The request could not be completed.",
): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof TypeError) {
    return new ApiError(
      "Unable to reach the server. Check your connection and try again.",
      null,
      "network",
    );
  }
  if (error instanceof Error) {
    return new ApiError(error.message || fallback, null, "unknown");
  }
  return new ApiError(fallback, null, "unknown");
}

export function createResponseError(
  status: number,
  message?: string,
): ApiError {
  return new ApiError(
    message || `Request failed with status ${status}.`,
    status,
    kindForStatus(status),
  );
}
