import { PrismaClient, Task, Prisma } from "../../generated/prisma";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";

const prisma = new PrismaClient();

export const createTask = async (data: CreateTaskDto): Promise<Task> => {
  if (!data.title) {
    throw new Error("Title is required");
  }

  const taskData: Prisma.TaskCreateInput = {
    ...data,
    completed: data.completed || false,
  };

  return prisma.task.create({ data: taskData });
};

export const getAllTasks = async (): Promise<Task[]> => {
  return prisma.task.findMany();
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  return prisma.task.findUnique({
    where: { id },
  });
};

export const updateTask = async (
  id: string,
  data: UpdateTaskDto
): Promise<Task | null> => {
  const updateData: Prisma.TaskUpdateInput = data;

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

export const deleteTask = async (id: string): Promise<Task | null> => {
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
