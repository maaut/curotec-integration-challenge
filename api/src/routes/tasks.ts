import { Router } from "express";
import {
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
} from "../controllers/task.controller";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
} from "../validations/task.validation";

const router = Router();

router.post("/tasks", validateRequest(createTaskSchema), createTaskController);

router.get("/tasks", getAllTasksController);

router.get("/tasks/:id", validateRequest(taskIdSchema), getTaskByIdController);

router.put(
  "/tasks/:id",
  validateRequest(updateTaskSchema),
  updateTaskController
);

router.delete(
  "/tasks/:id",
  validateRequest(taskIdSchema),
  deleteTaskController
);

export default router;
