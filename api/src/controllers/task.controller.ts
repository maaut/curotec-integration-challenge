import { Request, Response } from "express";
import * as TaskService from "../services/task.service";

export const createTaskController = async (req: Request, res: Response) => {
  try {
    const task = await TaskService.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const getAllTasksController = async (req: Request, res: Response) => {
  try {
    const tasks = await TaskService.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error("Controller - Failed to retrieve tasks:", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
};

export const getTaskByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const task = await TaskService.getTaskById(id);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (error) {
    console.error("Controller - Failed to retrieve task:", error);
    res.status(500).json({ error: "Failed to retrieve task" });
  }
};

export const updateTaskController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const task = await TaskService.updateTask(id, req.body);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (error) {
    console.error("Controller - Failed to update task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTaskController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const task = await TaskService.deleteTask(id);
    if (task) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (error) {
    console.error("Controller - Failed to delete task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};
