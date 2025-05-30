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

/**
 * @openapi
 * /tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task
 *     description: Creates a new task for the authenticated user. Can optionally include an invitee by email.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskDto'
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request body (e.g., missing title).
 *       401:
 *         description: User not authenticated.
 *       500:
 *         description: An unexpected error occurred.
 */
router.post(
  "/tasks",
  authMiddleware,
  validateRequest(createTaskSchema),
  createTaskController
);

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get all tasks for the authenticated user
 *     description: Retrieves a paginated list of tasks for the authenticated user. Can be filtered and sorted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tasks per page.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, completed, updatedAt]
 *           default: createdAt
 *         description: Field to sort by.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order.
 *       - in: query
 *         name: completed
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *           default: all
 *         description: Filter by task completion status.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for task title or description.
 *     responses:
 *       200:
 *         description: A list of tasks with pagination metadata.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTasksResponse'
 *       401:
 *         description: User not authenticated.
 *       500:
 *         description: Failed to retrieve tasks.
 */
router.get("/tasks", authMiddleware, getAllTasksController);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get a specific task by ID
 *     description: Retrieves a single task by its ID. The user must be the owner of the task.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the task to retrieve.
 *     responses:
 *       200:
 *         description: The requested task.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: Task not found or not owned by user.
 *       500:
 *         description: Failed to retrieve task.
 */
router.get(
  "/tasks/:id",
  authMiddleware,
  validateRequest(taskIdSchema),
  getTaskByIdController
);

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Update an existing task
 *     description: Updates an existing task by its ID. The user must be the owner. Allows updating title, description, completion status, and invitee (via inviteeEmail).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the task to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskDto'
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: Task not found or not owned by user.
 *       500:
 *         description: Failed to update task.
 */
router.put(
  "/tasks/:id",
  authMiddleware,
  validateRequest(updateTaskSchema),
  updateTaskController
);

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task
 *     description: Deletes a task by its ID. The user must be the owner.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the task to delete.
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task deleted successfully
 *                 task:
 *                   $ref: '#/components/schemas/Task' # The deleted task object
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: Task not found or not owned by user.
 *       500:
 *         description: Failed to delete task.
 */
router.delete(
  "/tasks/:id",
  authMiddleware,
  validateRequest(taskIdSchema),
  deleteTaskController
);

/**
 * @openapi
 * /tasks/{id}/toggle:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Toggle task completion status
 *     description: Toggles the completion status of a task by its ID. The user must be the owner.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the task to toggle.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - completed
 *             properties:
 *               completed:
 *                 type: boolean
 *                 description: The new completion status.
 *     responses:
 *       200:
 *         description: Task completion status toggled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request body (e.g., 'completed' not a boolean).
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: Task not found or not owned by user.
 *       500:
 *         description: Failed to toggle task completion.
 */
router.put(
  "/tasks/:id/toggle",
  authMiddleware,
  validateRequest(toggleTaskSchema),
  toggleTaskCompletionController
);

/**
 * @openapi
 * /tasks/{id}/invite:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Invite a user to a task
 *     description: Invites another user (by email) to collaborate on a specific task. Only the task owner can perform this action.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the task to invite a user to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteeEmail
 *             properties:
 *               inviteeEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the user to invite.
 *     responses:
 *       200:
 *         description: User invited successfully. Returns the updated task.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request (e.g., trying to invite self, invalid email format).
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: Task not found, user not found, or requester is not the owner.
 *       500:
 *         description: Failed to invite user to task.
 */
router.post(
  "/tasks/:id/invite",
  authMiddleware,
  validateRequest(inviteTaskSchema),
  inviteToTaskController
);

/**
 * @openapi
 * /tasks/{id}/uninvite:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Uninvite a user from a task
 *     description: Removes the invited user from a specific task. Only the task owner can perform this action.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the task to uninvite a user from.
 *     responses:
 *       200:
 *         description: User uninvited successfully. Returns the updated task (with invitee as null).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: Task not found, requester is not the owner, or no user was invited.
 *       500:
 *         description: Failed to uninvite user from task.
 */
router.delete(
  "/tasks/:id/uninvite",
  authMiddleware,
  validateRequest(taskIdSchema),
  uninviteFromTaskController
);

export default router;
