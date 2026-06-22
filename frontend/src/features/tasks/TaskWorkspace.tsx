import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  toInputStatus,
  updateTask,
} from "../../api/tasks";
import { normalizeApiError } from "../../api/errors";
import { Button } from "../../components/Button";
import { InputField, SelectField } from "../../components/Field";
import { EmptyState, InlineAlert, Spinner } from "../../components/Feedback";
import { Modal } from "../../components/Modal";
import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  TaskInputStatus,
  UpdateTaskInput,
} from "../../types/api";
import { useAuth } from "../auth/auth-state";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";

interface TaskWorkspaceProps {
  onRequestLogin: () => void;
}

export function TaskWorkspace({ onRequestLogin }: TaskWorkspaceProps) {
  const { status } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [categoryDraft, setCategoryDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [mutatingId, setMutatingId] = useState<number | "create" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    setError(null);
    try {
      const response = await listTasks(filters);
      setTasks(response.data.tasks);
    } catch (caught) {
      setError(normalizeApiError(caught).message);
    } finally {
      setLoading(false);
    }
  }, [filters, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "PENDING").length,
      checked: tasks.filter((task) => task.status === "CHECKED").length,
    }),
    [tasks],
  );

  if (status === "restoring") {
    return (
      <section className="tasks-panel" aria-labelledby="tasks-title">
        <Spinner label="Restoring your task workspace…" />
      </section>
    );
  }

  if (status === "unauthenticated") {
    return (
      <section className="tasks-panel tasks-panel--locked" aria-labelledby="tasks-title">
        <EmptyState eyebrow="Private workspace" title="Plan when the weather matters.">
          Sign in to create, filter, update, and complete weather-aware tasks. Your
          task data remains scoped to your account.
        </EmptyState>
        <Button onClick={onRequestLogin}>Sign in for tasks</Button>
      </section>
    );
  }

  const submitCreate = async (input: CreateTaskInput | UpdateTaskInput) => {
    setMutatingId("create");
    setError(null);
    try {
      await createTask(input as CreateTaskInput);
      setNotice("Task created.");
      await load();
    } catch (caught) {
      setError(normalizeApiError(caught).message);
    } finally {
      setMutatingId(null);
    }
  };

  const submitEdit = async (input: CreateTaskInput | UpdateTaskInput) => {
    if (!editing) return;
    setMutatingId(editing.id);
    setError(null);
    try {
      await updateTask(editing.id, input as UpdateTaskInput);
      setEditing(null);
      setNotice("Task updated.");
      await load();
    } catch (caught) {
      setError(normalizeApiError(caught).message);
    } finally {
      setMutatingId(null);
    }
  };

  const toggle = async (task: Task) => {
    setMutatingId(task.id);
    setError(null);
    try {
      await updateTask(task.id, {
        status: toInputStatus(task.status) === "pending" ? "checked" : "pending",
      });
      setNotice(`Task marked ${task.status === "PENDING" ? "checked" : "pending"}.`);
      await load();
    } catch (caught) {
      setError(normalizeApiError(caught).message);
    } finally {
      setMutatingId(null);
    }
  };

  const startEdit = async (task: Task) => {
    setMutatingId(task.id);
    setError(null);
    try {
      const response = await getTask(task.id);
      setEditing(response.data.task);
    } catch (caught) {
      setError(normalizeApiError(caught).message);
    } finally {
      setMutatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setMutatingId(deleting.id);
    setError(null);
    try {
      await deleteTask(deleting.id);
      setDeleting(null);
      setNotice("Task deleted.");
      await load();
    } catch (caught) {
      setError(normalizeApiError(caught).message);
    } finally {
      setMutatingId(null);
    }
  };

  const hasFilters = Boolean(filters.status || filters.category);

  return (
    <section className="tasks-panel" aria-labelledby="tasks-title">
      <div className="section-heading tasks-panel__heading">
        <div>
          <span className="eyebrow">Personal operations</span>
          <h2 id="tasks-title">Task flight plan</h2>
        </div>
        <Button variant="ghost" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="task-summary" aria-label="Task summary">
        <div><strong>{summary.total}</strong><span>Visible</span></div>
        <div><strong>{summary.pending}</strong><span>Pending</span></div>
        <div><strong>{summary.checked}</strong><span>Checked</span></div>
      </div>

      <details className="task-create" open>
        <summary>Create a task</summary>
        <TaskForm busy={mutatingId === "create"} onSubmit={submitCreate} />
      </details>

      <div className="task-filters" aria-label="Task filters">
        <SelectField
          id="task-status-filter"
          label="Status"
          value={filters.status || ""}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              status: (event.target.value || undefined) as TaskInputStatus | undefined,
            }))
          }
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="checked">Checked</option>
        </SelectField>
        <InputField
          id="task-category-filter"
          label="Category"
          value={categoryDraft}
          onChange={(event) => setCategoryDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              setFilters((current) => ({
                ...current,
                category: categoryDraft.trim() || undefined,
              }));
            }
          }}
          placeholder="general"
        />
        <div className="task-filters__actions">
          <Button
            variant="secondary"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                category: categoryDraft.trim() || undefined,
              }))
            }
          >
            Apply category
          </Button>
          <Button
            variant="ghost"
            disabled={!hasFilters && !categoryDraft}
            onClick={() => {
              setCategoryDraft("");
              setFilters({});
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>

      <div className="task-feedback" aria-live="polite">
        {notice ? (
          <InlineAlert tone="success">
            {notice}{" "}
            <button className="text-button" onClick={() => setNotice(null)}>
              Dismiss
            </button>
          </InlineAlert>
        ) : null}
        {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}
      </div>

      {loading ? <Spinner label="Loading your tasks…" /> : null}
      {!loading && tasks.length === 0 ? (
        <EmptyState
          eyebrow={hasFilters ? "No matches" : "Clear runway"}
          title={hasFilters ? "No tasks match these filters." : "No tasks yet."}
          action={
            hasFilters ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setCategoryDraft("");
                  setFilters({});
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        >
          {hasFilters
            ? "Adjust or clear the status and category filters."
            : "Create your first task above to start planning."}
        </EmptyState>
      ) : null}
      {!loading && tasks.length > 0 ? (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              busy={mutatingId === task.id}
              onEdit={(selected) => void startEdit(selected)}
              onToggle={(selected) => void toggle(selected)}
              onDelete={setDeleting}
            />
          ))}
        </div>
      ) : null}

      <Modal
        open={Boolean(editing)}
        title="Edit task"
        onClose={() => setEditing(null)}
      >
        <TaskForm
          task={editing}
          busy={Boolean(editing && mutatingId === editing.id)}
          onSubmit={submitEdit}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <Modal
        open={Boolean(deleting)}
        title="Delete task?"
        onClose={() => setDeleting(null)}
      >
        <p className="modal__intro">
          This permanently deletes “{deleting?.title}”. This action cannot be undone.
        </p>
        <div className="modal__actions">
          <Button
            variant="danger"
            busy={Boolean(deleting && mutatingId === deleting.id)}
            onClick={() => void confirmDelete()}
          >
            Delete task
          </Button>
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            Keep task
          </Button>
        </div>
      </Modal>
    </section>
  );
}
