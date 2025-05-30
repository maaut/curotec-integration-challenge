import { PrismaClient, Task, Prisma, User } from "../../generated/prisma";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";
import { GetAllTasksParams, PaginatedTasksResponse } from "../types/task.types";

const prisma = new PrismaClient();

const selectInviteeFields = {
  id: true,
  email: true,
};

export const createTask = async (
  taskInput: CreateTaskDto,
  userId: string
): Promise<Task> => {
  if (!taskInput.title) {
    throw new Error("Title is required");
  }

  const { inviteeEmail, ...taskDataWithoutInvitee } = taskInput;
  const taskCreateData: Prisma.TaskCreateInput = {
    ...taskDataWithoutInvitee,
    completed: taskInput.completed || false,
    user: { connect: { id: userId } },
  };

  if (inviteeEmail) {
    if (
      inviteeEmail.toLowerCase() ===
      (
        await prisma.user.findUnique({ where: { id: userId } })
      )?.email.toLowerCase()
    ) {
    } else {
      const invitee = await prisma.user.findUnique({
        where: { email: inviteeEmail },
      });
      if (invitee) {
        taskCreateData.invitee = { connect: { id: invitee.id } };
      }
    }
  }

  return prisma.task.create({
    data: taskCreateData,
    include: { invitee: { select: selectInviteeFields } },
  });
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

  const where: Prisma.TaskWhereInput = {
    OR: [{ userId }, { inviteeId: userId }],
  };

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
    include: { invitee: { select: selectInviteeFields } },
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
    include: { invitee: { select: selectInviteeFields } },
  });
};

export const updateTask = async (
  id: string,
  taskInput: UpdateTaskDto,
  userId: string
): Promise<Task | null> => {
  const task = await prisma.task.findFirst({
    where: { id, userId },
    include: {
      user: { select: { email: true } },
    },
  });

  if (!task) {
    return null;
  }

  const { inviteeEmail, inviteeId, invitee, ...taskDataWithoutInvitee } =
    taskInput;
  const updateData: Prisma.TaskUpdateInput = { ...taskDataWithoutInvitee };

  if (inviteeEmail !== undefined) {
    if (inviteeEmail === null || inviteeEmail === "") {
      updateData.invitee = { disconnect: true };
    } else {
      if (
        task.user &&
        inviteeEmail.toLowerCase() === task.user.email.toLowerCase()
      ) {
      } else {
        const inviteeUser = await prisma.user.findUnique({
          where: { email: inviteeEmail },
        });
        if (inviteeUser) {
          if (inviteeUser.id === userId) {
          } else {
            updateData.invitee = { connect: { id: inviteeUser.id } };
          }
        } else {
          throw new Error(`Invitee email ${inviteeEmail} not found.`);
        }
      }
    }
  }

  try {
    return await prisma.task.update({
      where: { id },
      data: updateData,
      include: { invitee: { select: selectInviteeFields } },
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

export const toggleTaskCompletion = async (
  id: string,
  completed: boolean,
  userId: string
): Promise<Task | null> => {
  const task = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!task) {
    return null;
  }

  try {
    return await prisma.task.update({
      where: { id },
      data: { completed },
      include: { invitee: { select: selectInviteeFields } },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return null;
    }
    throw error;
  }
};

export const inviteUserToTask = async (
  taskId: string,
  ownerId: string,
  inviteeEmail: string
): Promise<Task | null> => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: ownerId },
    include: { user: true },
  });

  if (!task) {
    throw new Error("Task not found or you are not the owner.");
  }

  if (task.user?.email.toLowerCase() === inviteeEmail.toLowerCase()) {
    throw new Error("Cannot invite the task owner to their own task.");
  }

  const inviteeUser = await prisma.user.findUnique({
    where: { email: inviteeEmail },
  });
  if (!inviteeUser) {
    throw new Error(`User with email ${inviteeEmail} not found.`);
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { invitee: { connect: { id: inviteeUser.id } } },
    include: {
      invitee: { select: selectInviteeFields },
      user: { select: selectInviteeFields },
    },
  });
};

export const uninviteUserFromTask = async (
  taskId: string,
  ownerId: string
): Promise<Task | null> => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: ownerId },
  });

  if (!task) {
    throw new Error("Task not found or you are not the owner.");
  }

  if (!task.inviteeId) {
    throw new Error("No user is currently invited to this task.");
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { invitee: { disconnect: true } },
    include: {
      invitee: { select: selectInviteeFields },
      user: { select: selectInviteeFields },
    },
  });
};
