import { delay, http, HttpResponse } from "msw";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { session } from "../../api/session";
import { AuthProvider } from "../auth/AuthContext";
import { server } from "../../test/setup";
import { makeTask, testUser } from "../../test/fixtures";
import type { Task } from "../../types/api";
import { TaskWorkspace } from "./TaskWorkspace";

function renderWorkspace() {
  session.setToken("valid-token");
  server.use(
    http.get("/api/auth/me", () =>
      HttpResponse.json({ status: "success", data: { user: testUser } }),
    ),
  );
  return render(
    <AuthProvider>
      <TaskWorkspace onRequestLogin={() => undefined} />
    </AuthProvider>,
  );
}

describe("task workspace", () => {
  let tasks: Task[];

  beforeEach(() => {
    tasks = [makeTask()];
  });

  it("shows a loading state while tasks are fetched", async () => {
    server.use(
      http.get("/api/tasks", async () => {
        await delay(100);
        return HttpResponse.json({
          status: "success",
          results: tasks.length,
          data: { tasks },
        });
      }),
    );

    renderWorkspace();

    expect(await screen.findByText("Loading your tasks…")).toBeInTheDocument();
    expect(await screen.findByText(tasks[0].title)).toBeInTheDocument();
  });

  it("shows the empty task state", async () => {
    server.use(
      http.get("/api/tasks", () =>
        HttpResponse.json({ status: "success", results: 0, data: { tasks: [] } }),
      ),
    );

    renderWorkspace();

    expect(await screen.findByText("No tasks yet.")).toBeInTheDocument();
  });

  it("creates a task and refreshes the server-owned list", async () => {
    const user = userEvent.setup();
    tasks = [];
    server.use(
      http.get("/api/tasks", () =>
        HttpResponse.json({
          status: "success",
          results: tasks.length,
          data: { tasks },
        }),
      ),
      http.post("/api/tasks", async ({ request }) => {
        const input = (await request.json()) as { title: string; category: string };
        const created = makeTask({
          id: 8,
          title: input.title,
          category: input.category,
        });
        tasks = [created];
        return HttpResponse.json(
          { status: "success", data: { task: created } },
          { status: 201 },
        );
      }),
    );

    renderWorkspace();
    await screen.findByText("No tasks yet.");
    await user.type(screen.getByLabelText("Task title"), "Review Paris conditions");
    const createCategory = screen.getByLabelText("Category", {
      selector: "#new-task-category",
    });
    await user.clear(createCategory);
    await user.type(createCategory, "daily");
    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(await screen.findByText("Task created.")).toBeInTheDocument();
    expect(await screen.findByText("Review Paris conditions")).toBeInTheDocument();
    expect(screen.getByText("daily")).toBeInTheDocument();
  });

  it("updates task status through the lowercase request mapping", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("/api/tasks", () =>
        HttpResponse.json({
          status: "success",
          results: tasks.length,
          data: { tasks },
        }),
      ),
      http.patch("/api/tasks/:id", async ({ request }) => {
        const input = (await request.json()) as { status: string };
        expect(input.status).toBe("checked");
        tasks = [{ ...tasks[0], status: "CHECKED" }];
        return HttpResponse.json({ status: "success", data: { task: tasks[0] } });
      }),
    );

    renderWorkspace();
    await user.click(await screen.findByRole("button", { name: "Mark checked" }));

    expect(await screen.findByText("Task marked checked.")).toBeInTheDocument();
    expect(
      await screen.findByText("Checked", { selector: ".status-badge" }),
    ).toBeInTheDocument();
  });

  it("loads one task by ID and saves edited fields", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("/api/tasks", () =>
        HttpResponse.json({
          status: "success",
          results: tasks.length,
          data: { tasks },
        }),
      ),
      http.get("/api/tasks/:id", () =>
        HttpResponse.json({ status: "success", data: { task: tasks[0] } }),
      ),
      http.patch("/api/tasks/:id", async ({ request }) => {
        const input = (await request.json()) as { title: string };
        tasks = [{ ...tasks[0], title: input.title }];
        return HttpResponse.json({ status: "success", data: { task: tasks[0] } });
      }),
    );

    renderWorkspace();
    await user.click(await screen.findByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog", { name: "Edit task" });
    const title = within(dialog).getByLabelText("Task title");
    await user.clear(title);
    await user.type(title, "Review the updated forecast");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Task updated.")).toBeInTheDocument();
    expect(await screen.findByText("Review the updated forecast")).toBeInTheDocument();
  });

  it("deletes a task through an accessible confirmation", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("/api/tasks", () =>
        HttpResponse.json({
          status: "success",
          results: tasks.length,
          data: { tasks },
        }),
      ),
      http.delete("/api/tasks/:id", () => {
        tasks = [];
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderWorkspace();
    await user.click(await screen.findByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("dialog", { name: "Delete task?" });
    expect(within(dialog).getByText(/permanently deletes/i)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Delete task" }));

    expect(await screen.findByText("Task deleted.")).toBeInTheDocument();
    expect(await screen.findByText("No tasks yet.")).toBeInTheDocument();
  });

  it("sends the selected status filter to the API", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("/api/tasks", ({ request }) => {
        const status = new URL(request.url).searchParams.get("status");
        const filtered = status === "checked" ? [makeTask({ status: "CHECKED" })] : tasks;
        return HttpResponse.json({
          status: "success",
          results: filtered.length,
          data: { tasks: filtered },
        });
      }),
    );

    renderWorkspace();
    await screen.findByText(tasks[0].title);
    await user.selectOptions(screen.getByLabelText("Status"), "checked");

    await waitFor(() =>
      expect(
        screen.getByText("Checked", { selector: ".status-badge" }),
      ).toBeInTheDocument(),
    );
  });

  it("sends the category filter and supports an empty filtered state", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("/api/tasks", ({ request }) => {
        const category = new URL(request.url).searchParams.get("category");
        const filtered = category === "daily" ? [] : tasks;
        return HttpResponse.json({
          status: "success",
          results: filtered.length,
          data: { tasks: filtered },
        });
      }),
    );

    renderWorkspace();
    await screen.findByText(tasks[0].title);
    await user.type(
      screen.getByLabelText("Category", {
        selector: "#task-category-filter",
      }),
      "daily",
    );
    await user.click(screen.getByRole("button", { name: "Apply category" }));

    expect(
      await screen.findByText("No tasks match these filters."),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Clear filters" }),
    ).toHaveLength(2);
  });

  it("clears the session when a protected task request returns 401", async () => {
    server.use(
      http.get("/api/tasks", () =>
        HttpResponse.json(
          { status: "fail", message: "Authentication token has been revoked" },
          { status: 401 },
        ),
      ),
    );

    renderWorkspace();

    expect(
      await screen.findByRole("button", { name: "Sign in for tasks" }),
    ).toBeInTheDocument();
    expect(session.getToken()).toBeNull();
  });
});
