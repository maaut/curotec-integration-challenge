import { PrismaClient, Task } from "../../generated/prisma"; // Adjusted import path

const prisma = new PrismaClient();

export const createTask = async (data: {
  title: string;
  description?: string;
  completed?: boolean;
}): Promise<Task> => {
  if (!data.title) {
    throw new Error("Title is required");
  }

  return prisma.task.create({
    data: {
      ...data,
      completed: data.completed || false,
    },
  });
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
  data: { title?: string; description?: string; completed?: boolean }
): Promise<Task | null> => {
  try {
    return await prisma.task.update({
      where: { id },
      data,
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
