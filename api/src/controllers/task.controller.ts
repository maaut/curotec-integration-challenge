import { Request, Response } from "express";
import * as TaskService from "../services/task.service";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";
import { GetAllTasksParams } from "../types/task.types";

export const createTaskController = async (
  req: Request<{}, {}, CreateTaskDto>,
  res: Response
) => {
  try {
    const task = await TaskService.createTask(req.body);
    res.status(201).json(task);
  } catch (error: any) {
    if (error.message === "Title is required") {
      res.status(400).json({ error: error.message });
    }
    console.error(
      "Controller - Failed to create task:",
      error.message || error
    );
    res
      .status(500)
      .json({ error: "An unexpected error occurred while creating the task" });
  }
};

export const getAllTasksController = async (req: Request, res: Response) => {
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

    const result = await TaskService.getAllTasks(params);
    res.json(result);
  } catch (error: any) {
    console.error(
      "Controller - Failed to retrieve tasks:",
      error.message || error
    );
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
};

export const getTaskByIdController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  try {
    const task = await TaskService.getTaskById(id);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (error: any) {
    console.error(
      "Controller - Failed to retrieve task:",
      error.message || error
    );
    res.status(500).json({ error: "Failed to retrieve task" });
  }
};

export const updateTaskController = async (
  req: Request<{ id: string }, {}, UpdateTaskDto>,
  res: Response
) => {
  const { id } = req.params;
  try {
    const task = await TaskService.updateTask(id, req.body);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (error: any) {
    console.error(
      "Controller - Failed to update task:",
      error.message || error
    );
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTaskController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  try {
    const task = await TaskService.deleteTask(id);
    if (task) {
      res.status(204).send("Task deleted successfully");
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (error: any) {
    console.error(
      "Controller - Failed to delete task:",
      error.message || error
    );
    res.status(500).json({ error: "Failed to delete task" });
  }
};
