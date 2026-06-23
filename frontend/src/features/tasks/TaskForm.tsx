import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { InputField, TextareaField } from "../../components/Field";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../../types/api";

interface TaskFormProps {
  task?: Task | null;
  busy: boolean;
  onSubmit: (input: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onCancel?: () => void;
}

/**
 * Normalizes task form values for both create and edit workflows.
 *
 * When the selected task changes, the effect replaces local draft state with
 * the server-owned values used by the edit dialog.
 */
export function TaskForm({ task, busy, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("general");
  const [titleError, setTitleError] = useState<string | undefined>();

  useEffect(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setCity(task?.city || "");
    setCategory(task?.category || "general");
    setTitleError(undefined);
  }, [task]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Title is required.");
      return;
    }
    if (trimmedTitle.length > 120) {
      setTitleError("Title must not exceed 120 characters.");
      return;
    }
    setTitleError(undefined);
    await onSubmit({
      title: trimmedTitle,
      description: description.trim() || null,
      city: city.trim() || null,
      category: category.trim() || "general",
    });
    if (!task) {
      // Create mode clears the draft only after the parent mutation resolves;
      // edit mode remains populated until its dialog closes.
      setTitle("");
      setDescription("");
      setCity("");
      setCategory("general");
    }
  };

  return (
    <form className="task-form" onSubmit={submit}>
      <InputField
        id={task ? `edit-title-${task.id}` : "new-task-title"}
        label="Task title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={120}
        error={titleError}
        hint={`${title.length}/120 characters`}
        placeholder="Check weather before the morning commute"
      />
      <div className="form-grid">
        <InputField
          id={task ? `edit-city-${task.id}` : "new-task-city"}
          label="City (optional)"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="London"
        />
        <InputField
          id={task ? `edit-category-${task.id}` : "new-task-category"}
          label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="general"
        />
      </div>
      <TextareaField
        id={task ? `edit-description-${task.id}` : "new-task-description"}
        label="Description (optional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
        placeholder="Add the context you will need later."
      />
      <div className="task-form__actions">
        <Button type="submit" busy={busy}>
          {task ? "Save changes" : "Create task"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
