import prisma from "../lib/prisma.js";

const taskSelect = {
  id: true,
  title: true,
  description: true,
  city: true,
  category: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Creates a task owned by the authenticated user identifier supplied by the
 * controller.
 */
export async function createTaskForUser(userId, taskData) {
  return prisma.task.create({
    data: {
      title: taskData.title,
      description: taskData.description,
      city: taskData.city,
      category: taskData.category,
      userId,
    },
    select: taskSelect,
  });
}

/**
 * Returns tasks scoped to one owner, with optional status and category
 * filters applied in the database query.
 */
export async function getTasksForUser(userId, filters = {}) {
  const where = {
    userId,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  return prisma.task.findMany({
    where,
    select: taskSelect,
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Retrieves a task only when both its identifier and owner match.
 *
 * Applying both predicates prevents a task identifier from acting as an
 * authorization credential.
 */
export async function getTaskByIdForUser(userId, taskId) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
    select: taskSelect,
  });
}

/**
 * Updates an owned task and returns null when the task is missing or belongs
 * to another user.
 *
 * The indistinguishable result preserves the controller's not-found boundary
 * for both cases.
 */
export async function updateTaskForUser(userId, taskId, taskData) {
  const updateResult = await prisma.task.updateMany({
    where: {
      id: taskId,
      userId,
    },
    data: taskData,
  });

  if (updateResult.count === 0) {
    return null;
  }

  return getTaskByIdForUser(userId, taskId);
}

/**
 * Deletes a task only when both the task identifier and owner match.
 */
export async function deleteTaskForUser(userId, taskId) {
  const deleteResult = await prisma.task.deleteMany({
    where: {
      id: taskId,
      userId,
    },
  });

  return deleteResult.count > 0;
}
