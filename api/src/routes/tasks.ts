import { Router } from "express";
import {
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
  toggleTaskCompletionController,
  inviteToTaskController,
  uninviteFromTaskController,
} from "../controllers/task.controller";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  toggleTaskSchema,
  inviteTaskSchema,
} from "../validations/task.validation";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

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

router.put(
  "/tasks/:id/toggle",
  authMiddleware,
  validateRequest(toggleTaskSchema),
  toggleTaskCompletionController
);

router.post(
  "/tasks/:id/invite",
  authMiddleware,
  validateRequest(inviteTaskSchema),
  inviteToTaskController
);

router.delete(
  "/tasks/:id/uninvite",
  authMiddleware,
  validateRequest(taskIdSchema),
  uninviteFromTaskController
);

export default router;
