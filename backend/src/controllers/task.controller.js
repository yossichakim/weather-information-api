import {
  createTaskForUser,
  deleteTaskForUser,
  getTaskByIdForUser,
  getTasksForUser,
  updateTaskForUser,
} from "../services/task.service.js";

const VALID_TASK_STATUSES = ["PENDING", "CHECKED"];

function parseTaskId(value) {
  const taskId = Number(value);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return null;
  }

  return taskId;
}

function hasOwn(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

/**
 * Validates and normalizes task input before creating a record for the
 * authenticated user supplied by the bearer-token middleware.
 */
export async function createTask(req, res, next) {
  const body = req.body ?? {};

  if (typeof body.title !== "string" || !body.title.trim()) {
    return res.status(400).json({
      status: "fail",
      message: "Title is required",
    });
  }

  const title = body.title.trim();

  if (title.length > 120) {
    return res.status(400).json({
      status: "fail",
      message: "Title must not exceed 120 characters",
    });
  }

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    return res.status(400).json({
      status: "fail",
      message: "Description must be a string or null",
    });
  }

  if (
    body.city !== undefined &&
    body.city !== null &&
    typeof body.city !== "string"
  ) {
    return res.status(400).json({
      status: "fail",
      message: "City must be a string or null",
    });
  }

  if (
    body.category !== undefined &&
    typeof body.category !== "string"
  ) {
    return res.status(400).json({
      status: "fail",
      message: "Category must be a string",
    });
  }

  const category = body.category?.trim() || "general";

  try {
    const task = await createTaskForUser(req.user.id, {
      title,
      description: body.description?.trim() || null,
      city: body.city?.trim() || null,
      category,
    });

    return res.status(201).json({
      status: "success",
      data: {
        task,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Lists only tasks owned by the authenticated user and translates optional
 * HTTP query values into the service-layer filter shape.
 */
export async function getTasks(req, res, next) {
  if (
    req.query.status !== undefined &&
    typeof req.query.status !== "string"
  ) {
    return res.status(400).json({
      status: "fail",
      message: "Status must be a string",
    });
  }

  if (
    req.query.category !== undefined &&
    typeof req.query.category !== "string"
  ) {
    return res.status(400).json({
      status: "fail",
      message: "Category must be a string",
    });
  }

  const status = req.query.status?.trim().toUpperCase();
  const category = req.query.category?.trim() || undefined;

  if (status && !VALID_TASK_STATUSES.includes(status)) {
    return res.status(400).json({
      status: "fail",
      message: "Status must be pending or checked",
    });
  }

  try {
    const tasks = await getTasksForUser(req.user.id, {
      status,
      category,
    });

    return res.status(200).json({
      status: "success",
      results: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Retrieves a task only when its identifier and authenticated owner match.
 *
 * Missing and cross-user resources share the same not-found response.
 */
export async function getTaskById(req, res, next) {
  const taskId = parseTaskId(req.params.id);

  if (!taskId) {
    return res.status(400).json({
      status: "fail",
      message: "Task ID must be a positive integer",
    });
  }

  try {
    const task = await getTaskByIdForUser(req.user.id, taskId);

    if (!task) {
      return res.status(404).json({
        status: "fail",
        message: "Task not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        task,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Builds a partial update from explicitly supplied fields and delegates the
 * ownership-constrained mutation to the task service.
 */
export async function updateTask(req, res, next) {
  const taskId = parseTaskId(req.params.id);

  if (!taskId) {
    return res.status(400).json({
      status: "fail",
      message: "Task ID must be a positive integer",
    });
  }

  const body = req.body ?? {};
  const updates = {};

  if (hasOwn(body, "title")) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return res.status(400).json({
        status: "fail",
        message: "Title must be a non-empty string",
      });
    }

    const title = body.title.trim();

    if (title.length > 120) {
      return res.status(400).json({
        status: "fail",
        message: "Title must not exceed 120 characters",
      });
    }

    updates.title = title;
  }

  if (hasOwn(body, "description")) {
    if (
      body.description !== null &&
      typeof body.description !== "string"
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Description must be a string or null",
      });
    }

    updates.description = body.description?.trim() || null;
  }

  if (hasOwn(body, "city")) {
    if (body.city !== null && typeof body.city !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "City must be a string or null",
      });
    }

    updates.city = body.city?.trim() || null;
  }

  if (hasOwn(body, "category")) {
    if (
      typeof body.category !== "string" ||
      !body.category.trim()
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Category must be a non-empty string",
      });
    }

    updates.category = body.category.trim();
  }

  if (hasOwn(body, "status")) {
    if (typeof body.status !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "Status must be a string",
      });
    }

    const status = body.status.trim().toUpperCase();

    if (!VALID_TASK_STATUSES.includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: "Status must be pending or checked",
      });
    }

    updates.status = status;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      status: "fail",
      message:
        "At least one task field must be provided for update",
    });
  }

  try {
    const task = await updateTaskForUser(
      req.user.id,
      taskId,
      updates
    );

    if (!task) {
      return res.status(404).json({
        status: "fail",
        message: "Task not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        task,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Deletes a task only when it belongs to the authenticated user.
 *
 * A task identifier alone does not grant access to the resource.
 */
export async function deleteTask(req, res, next) {
  const taskId = parseTaskId(req.params.id);

  if (!taskId) {
    return res.status(400).json({
      status: "fail",
      message: "Task ID must be a positive integer",
    });
  }

  try {
    const wasDeleted = await deleteTaskForUser(
      req.user.id,
      taskId
    );

    if (!wasDeleted) {
      return res.status(404).json({
        status: "fail",
        message: "Task not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
