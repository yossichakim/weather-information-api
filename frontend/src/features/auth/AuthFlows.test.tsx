import { http, HttpResponse } from "msw";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../App";
import { session } from "../../api/session";
import { server } from "../../test/setup";
import { testUser } from "../../test/fixtures";
import { AuthProvider } from "./AuthContext";

function renderApp() {
  return render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  );
}

/**
 * Installs the minimum authenticated handlers needed after session restoration
 * so authentication assertions are not coupled to task feature details.
 */
function authenticatedBaseHandlers() {
  server.use(
    http.get("/api/auth/me", () =>
      HttpResponse.json({ status: "success", data: { user: testUser } }),
    ),
    http.get("/api/tasks", () =>
      HttpResponse.json({
        status: "success",
        results: 0,
        data: { tasks: [] },
      }),
    ),
  );
}

describe("authentication flows", () => {
  it("logs in successfully and opens the protected workspace", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({
          status: "success",
          data: { user: testUser, accessToken: "valid-token" },
        }),
      ),
      http.get("/api/tasks", () =>
        HttpResponse.json({
          status: "success",
          results: 0,
          data: { tasks: [] },
        }),
      ),
    );

    renderApp();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    const dialog = screen.getByRole("dialog", { name: "Sign in to operations" });
    await user.type(within(dialog).getByLabelText("Email"), testUser.email);
    await user.type(within(dialog).getByLabelText("Password"), "StrongPassword123");
    await user.click(within(dialog).getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText(/Signed in as/)).toBeInTheDocument();
    expect(screen.getByText(testUser.email)).toBeInTheDocument();
    expect(session.getToken()).toBe("valid-token");
    expect(await screen.findByText("No tasks yet.")).toBeInTheDocument();
  });

  it("shows a failed login response without persisting a token", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json(
          { status: "error", message: "Invalid email or password" },
          { status: 401 },
        ),
      ),
    );

    renderApp();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    const dialog = screen.getByRole("dialog", { name: "Sign in to operations" });
    await user.type(within(dialog).getByLabelText("Email"), testUser.email);
    await user.type(within(dialog).getByLabelText("Password"), "wrong-password");
    await user.click(within(dialog).getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(session.getToken()).toBeNull();
  });

  it("restores a stored session through the current-user endpoint", async () => {
    session.setToken("restored-token");
    authenticatedBaseHandlers();

    renderApp();

    expect(screen.getByText("Restoring session…")).toBeInTheDocument();
    expect(await screen.findByText(testUser.email)).toBeInTheDocument();
    expect(await screen.findByText("No tasks yet.")).toBeInTheDocument();
  });

  it("clears an invalid restored token", async () => {
    session.setToken("expired-token");
    server.use(
      http.get("/api/auth/me", () =>
        HttpResponse.json(
          { status: "fail", message: "Authentication token is invalid or expired" },
          { status: 401 },
        ),
      ),
    );

    renderApp();

    // The protected 401 must clear persistent storage as well as returning the
    // interface to its unauthenticated state.
    expect(
      await screen.findByRole("button", { name: "Sign in for tasks" }),
    ).toBeInTheDocument();
    expect(session.getToken()).toBeNull();
  });

  it("registers without inventing an authenticated session", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("/api/auth/register", () =>
        HttpResponse.json(
          { status: "success", data: { user: testUser } },
          { status: 201 },
        ),
      ),
    );

    renderApp();
    await user.click(screen.getByRole("button", { name: "Create account" }));
    const dialog = screen.getByRole("dialog", { name: "Create your account" });
    await user.type(within(dialog).getByLabelText("Email"), testUser.email);
    await user.type(within(dialog).getByLabelText("Password"), "StrongPassword123");
    await user.click(within(dialog).getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Account created. You can sign in now.")).toBeInTheDocument();
    // Registration returns a user but no token, so the client must not infer a
    // session that the backend did not issue.
    expect(session.getToken()).toBeNull();
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Sign in to operations" })).toBeInTheDocument(),
    );
  });
});
