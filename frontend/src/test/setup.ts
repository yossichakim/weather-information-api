import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";

// An empty global server makes every network dependency explicit in the test
// that uses it; unhandled requests fail instead of reaching a real backend.
export const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  // Reset request handlers and persisted credentials so no test inherits
  // transport or authentication state from a previous scenario.
  cleanup();
  server.resetHandlers();
  window.localStorage.clear();
});

afterAll(() => server.close());

// jsdom does not consistently provide the imperative dialog methods used by
// the production Modal component, so the test environment supplies their
// observable open/close behavior.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
}

if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
