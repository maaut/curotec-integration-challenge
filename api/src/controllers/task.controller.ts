import { Request, Response } from "express";
import * as TaskService from "../services/task.service";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";
import { GetAllTasksParams } from "../types/task.types";

export const createTaskController = async (
  req: Request<{}, {}, CreateTaskDto>,
  res: Response
): Promise<void> => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  const userId = req.user.id;

  try {
    const task = await TaskService.createTask(req.body, userId);
    res.status(201).json(task);
    return;
  } catch (error: any) {
    if (error.message === "Title is required") {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error(
      "Controller - Failed to create task:",
      error.message || error
    );
    res
      .status(500)
      .json({ error: "An unexpected error occurred while creating the task" });
    return;
  }
};

export const getAllTasksController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  const userId = req.user.id;

  try {
    const { page, limit, sortBy, sortOrder, completed, search } =
      req.query as unknown as GetAllTasksParams;

    const params: GetAllTasksParams = {
      page: page ? parseInt(String(page), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder: sortOrder ? (String(sortOrder) as "asc" | "desc") : undefined,
      completed: completed
        ? (String(completed) as "true" | "false" | "all")
        : undefined,
      search: search ? String(search) : undefined,
    };

    Object.keys(params).forEach(
      (key) => (params as any)[key] === undefined && delete (params as any)[key]
    );

    const result = await TaskService.getAllTasks(userId, params);
    res.json(result);
    return;
  } catch (error: any) {
    console.error(
      "Controller - Failed to retrieve tasks:",
      error.message || error
    );
    res.status(500).json({ error: "Failed to retrieve tasks" });
    return;
  }
};

export const getTaskByIdController = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  const userId = req.user.id;
  const { id: taskId } = req.params;

  try {
    const task = await TaskService.getTaskById(taskId, userId);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found or not owned by user" });
    }
    return;
  } catch (error: any) {
    console.error(
      "Controller - Failed to retrieve task:",
      error.message || error
    );
    res.status(500).json({ error: "Failed to retrieve task" });
    return;
  }
};

export const updateTaskController = async (
  req: Request<{ id: string }, {}, UpdateTaskDto>,
  res: Response
): Promise<void> => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  const userId = req.user.id;
  const { id: taskId } = req.params;

  try {
    const task = await TaskService.updateTask(taskId, req.body, userId);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found or not owned by user" });
    }
    return;
  } catch (error: any) {
    console.error(
      "Controller - Failed to update task:",
      error.message || error
    );
    res.status(500).json({ error: "Failed to update task" });
    return;
  }
};

export const deleteTaskController = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  const userId = req.user.id;
  const { id: taskId } = req.params;

  try {
    const task = await TaskService.deleteTask(taskId, userId);
    if (task) {
      res.status(200).json({ message: "Task deleted successfully", task });
    } else {
      res.status(404).json({ error: "Task not found or not owned by user" });
    }
    return;
  } catch (error: any) {
    console.error(
      "Controller - Failed to delete task:",
      error.message || error
    );
    res.status(500).json({ error: "Failed to delete task" });
    return;
  }
};

export const toggleTaskCompletionController = async (
  req: Request<{ id: string }, {}, { completed: boolean }>,
  res: Response
): Promise<void> => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  const userId = req.user.id;
  const { id: taskId } = req.params;
  const { completed } = req.body;

  if (typeof completed !== "boolean") {
    res.status(400).json({ error: "'completed' must be a boolean" });
    return;
  }

  try {
    const task = await TaskService.toggleTaskCompletion(
      taskId,
      completed,
      userId
    );
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found or not owned by user" });
    }
    return;
  } catch (error: any) {
    console.error(
      "Controller - Failed to toggle task completion:",
      error.message || error
    );
    res.status(500).json({ error: "Failed to toggle task completion" });
    return;
  }
};

export const inviteToTaskController = async (
  req: Request<{ id: string }, {}, { inviteeEmail: string }>,
  res: Response
): Promise<void> => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  const ownerId = req.user.id;
  const { id: taskId } = req.params;
  const { inviteeEmail } = req.body;

  try {
    const task = await TaskService.inviteUserToTask(
      taskId,
      ownerId,
      inviteeEmail
    );
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found or operation failed" });
    }
    return;
  } catch (error: any) {
    console.error(
      "Controller - Failed to invite user to task:",
      error.message || error
    );
    if (
      error.message.includes("not found") ||
      error.message.includes("not the owner")
    ) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("Cannot invite")) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to invite user to task" });
    }
    return;
  }
};

export const uninviteFromTaskController = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  const ownerId = req.user.id;
  const { id: taskId } = req.params;

  try {
    const task = await TaskService.uninviteUserFromTask(taskId, ownerId);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found or operation failed" });
    }
    return;
  } catch (error: any) {
    console.error(
      "Controller - Failed to uninvite user from task:",
      error.message || error
    );
    if (
      error.message.includes("not found") ||
      error.message.includes("not the owner") ||
      error.message.includes("No user is currently invited")
    ) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to uninvite user from task" });
    }
    return;
  }
};
