import { Button } from "../../components/Button";
import type { Task } from "../../types/api";

interface TaskCardProps {
  task: Task;
  busy: boolean;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({
  task,
  busy,
  onEdit,
  onToggle,
  onDelete,
}: TaskCardProps) {
  const complete = task.status === "CHECKED";
  return (
    <article className={`task-card ${complete ? "task-card--complete" : ""}`}>
      <div className="task-card__topline">
        <span className={`status-badge status-badge--${complete ? "checked" : "pending"}`}>
          {complete ? "Checked" : "Pending"}
        </span>
        <span className="category-badge">{task.category || "general"}</span>
      </div>
      <h3>{task.title}</h3>
      {task.description ? <p>{task.description}</p> : null}
      <div className="task-card__meta">
        {task.city ? <span>City · {task.city}</span> : <span>No city assigned</span>}
        <span>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
      </div>
      <div className="task-card__actions">
        <Button
          variant={complete ? "secondary" : "primary"}
          onClick={() => onToggle(task)}
          busy={busy}
        >
          Mark {complete ? "pending" : "checked"}
        </Button>
        <Button variant="ghost" onClick={() => onEdit(task)} disabled={busy}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => onDelete(task)} disabled={busy}>
          Delete
        </Button>
      </div>
    </article>
  );
}
