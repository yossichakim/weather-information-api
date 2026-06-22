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

export async function getTaskByIdForUser(userId, taskId) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
    select: taskSelect,
  });
}

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

export async function deleteTaskForUser(userId, taskId) {
  const deleteResult = await prisma.task.deleteMany({
    where: {
      id: taskId,
      userId,
    },
  });

  return deleteResult.count > 0;
}