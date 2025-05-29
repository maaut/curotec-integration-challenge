import { PrismaClient, Task, Prisma } from "../../generated/prisma";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";
import { GetAllTasksParams, PaginatedTasksResponse } from "../types/task.types";

const prisma = new PrismaClient();

export const createTask = async (
  data: CreateTaskDto,
  userId: string
): Promise<Task> => {
  if (!data.title) {
    throw new Error("Title is required");
  }

  const taskData: Prisma.TaskCreateInput = {
    ...data,
    completed: data.completed || false,
    user: { connect: { id: userId } },
  };

  return prisma.task.create({ data: taskData });
};

export const getAllTasks = async (
  userId: string,
  params: GetAllTasksParams = {}
): Promise<PaginatedTasksResponse> => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    completed,
    search,
  } = params;

  const where: Prisma.TaskWhereInput = { userId };

  if (completed && completed !== "all") {
    where.completed = completed === "true";
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const tasks = await prisma.task.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.task.count({ where });

  return {
    tasks,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getTaskById = async (
  id: string,
  userId: string
): Promise<Task | null> => {
  return prisma.task.findFirst({
    where: { id, userId },
  });
};

export const updateTask = async (
  id: string,
  data: UpdateTaskDto,
  userId: string
): Promise<Task | null> => {
  const updateData: Prisma.TaskUpdateInput = data;

  const task = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!task) {
    return null;
  }

  try {
    return await prisma.task.update({
      where: { id },
      data: updateData,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return null;
    }
    throw error;
  }
};

export const deleteTask = async (
  id: string,
  userId: string
): Promise<Task | null> => {
  const task = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!task) {
    return null;
  }

  try {
    return await prisma.task.delete({
      where: { id },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return null;
    }
    throw error;
  }
};
