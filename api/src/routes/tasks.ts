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
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// router.use(authMiddleware); // Commented out global application for this router

// Apply authMiddleware individually to each route
router.post(
  "/tasks",
  authMiddleware,
  validateRequest(createTaskSchema),
  createTaskController
);

router.get("/tasks", authMiddleware, getAllTasksController);

router.get(
  "/tasks/:id",
  authMiddleware,
  validateRequest(taskIdSchema),
  getTaskByIdController
);

router.put(
  "/tasks/:id",
  authMiddleware,
  validateRequest(updateTaskSchema),
  updateTaskController
);

router.delete(
  "/tasks/:id",
  authMiddleware,
  validateRequest(taskIdSchema),
  deleteTaskController
);

export default router;
