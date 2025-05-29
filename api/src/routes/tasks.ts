import { RequestHandler, Router } from "express";
import {
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
} from "../controllers/task.controller";

const router = Router();

router.post("/tasks", createTaskController);

router.get("/tasks", getAllTasksController);

router.get("/tasks/:id", getTaskByIdController);

router.put("/tasks/:id", updateTaskController);

router.delete("/tasks/:id", deleteTaskController);

export default router;
