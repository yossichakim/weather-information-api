import { describe, expect, it } from "vitest";
import { ApiError, createResponseError, normalizeApiError } from "./errors";

describe("API error normalization", () => {
  it("normalizes response and network errors into one predictable type", () => {
    const unauthorized = createResponseError(401, "Token expired");
    const network = normalizeApiError(new TypeError("Failed to fetch"));

    expect(unauthorized).toEqual(
      expect.objectContaining({
        name: "ApiError",
        status: 401,
        kind: "authentication",
        message: "Token expired",
      }),
    );
    expect(network).toBeInstanceOf(ApiError);
    expect(network.kind).toBe("network");
    expect(network.status).toBeNull();
  });
});
