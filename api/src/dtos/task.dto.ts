/**
 * @openapi
 * components:
 *   schemas:
 *     CreateTaskDto:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the task.
 *           example: "Buy groceries"
 *         description:
 *           type: string
 *           description: A detailed description of the task.
 *           example: "Milk, Eggs, Bread, and Cheese"
 *           nullable: true
 *         completed:
 *           type: boolean
 *           description: Whether the task is completed or not.
 *           default: false
 *           nullable: true
 *         inviteeEmail:
 *           type: string
 *           format: email
 *           description: Email of the user to invite to this task.
 *           example: "collaborator@example.com"
 *           nullable: true
 *     UpdateTaskDto:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the task.
 *           example: "Buy more groceries"
 *           nullable: true
 *         description:
 *           type: string
 *           description: A detailed description of the task.
 *           example: "Milk, Eggs, Bread, Cheese, and Cereal"
 *           nullable: true
 *         completed:
 *           type: boolean
 *           description: Whether the task is completed or not.
 *           nullable: true
 *         inviteeEmail:
 *           type: string
 *           format: email
 *           description: Email of the user to invite to this task. Send null or empty string to remove invitee.
 *           example: "newcollaborator@example.com"
 *           nullable: true # Can be null to remove invitee
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the task.
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         completed:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who owns the task.
 *         inviteeId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the user invited to the task.
 *         invitee:
 *           type: object
 *           nullable: true
 *           description: Details of the invited user (if any).
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             email:
 *               type: string
 *               format: email
 *         user: # Owner details, might be included in some responses
 *           type: object
 *           nullable: true
 *           description: Details of the task owner (if included).
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             email:
 *               type: string
 *               format: email
 *     PaginatedTasksResponse:
 *       type: object
 *       properties:
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *         total:
 *           type: integer
 *           description: Total number of tasks.
 *         page:
 *           type: integer
 *           description: Current page number.
 *         limit:
 *           type: integer
 *           description: Number of tasks per page.
 *         totalPages:
 *           type: integer
 *           description: Total number of pages.
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  completed?: boolean;
  inviteeEmail?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  inviteeId?: string;
  invitee?: {
    id: string;
    email: string;
  };
}
