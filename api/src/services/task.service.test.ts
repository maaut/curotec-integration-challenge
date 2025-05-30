import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "./task.service";
import { PrismaClient, Task, User } from "../../generated/prisma";
import type {
  GetAllTasksParams,
  PaginatedTasksResponse,
} from "../types/task.types";

jest.mock("../../generated/prisma", () => {
  const mPrismaClient = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient();

const mockSelectInviteeFields = {
  id: true,
  email: true,
};

describe("Task Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockImplementation(
      async ({ where }) => {
        if (where.id === "usr-1")
          return { id: "usr-1", email: "owner@example.com" };
        if (where.email === "invitee@example.com")
          return { id: "usr-invitee", email: "invitee@example.com" };
        return null;
      }
    );
  });

  describe("createTask", () => {
    it("should create a new task", async () => {
      const taskData = { title: "Test Task", description: "Test Description" };
      const expectedTask = {
        id: "1",
        ...taskData,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "usr-1",
      };
      (prisma.task.create as jest.Mock).mockResolvedValue(expectedTask);

      const result = await createTask(taskData, "usr-1");
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          ...taskData,
          completed: false,
          user: { connect: { id: "usr-1" } },
        },
        include: { invitee: { select: mockSelectInviteeFields } },
      });
      expect(result).toEqual(expectedTask);
    });

    it("should throw an error if title is missing", async () => {
      const taskData = { description: "Test Description" };
      // @ts-expect-error testing invalid input for title
      await expect(createTask(taskData, "usr-1")).rejects.toThrow(
        "Title is required"
      );
      expect(prisma.task.create).not.toHaveBeenCalled();
    });

    it("should set completed to false if not provided", async () => {
      const taskData = { title: "Test Task" };
      (prisma.task.create as jest.Mock).mockResolvedValue({
        id: "1",
        ...taskData,
        completed: false,
        userId: "usr-1",
      });

      await createTask(taskData, "usr-1");
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "Test Task",
          completed: false,
          user: { connect: { id: "usr-1" } },
        },
        include: { invitee: { select: mockSelectInviteeFields } },
      });
    });

    it("should use provided completed status", async () => {
      const taskData = { title: "Test Task", completed: true };
      (prisma.task.create as jest.Mock).mockResolvedValue({
        id: "1",
        ...taskData,
        userId: "usr-1",
      });

      await createTask(taskData, "usr-1");
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "Test Task",
          completed: true,
          user: { connect: { id: "usr-1" } },
        },
        include: { invitee: { select: mockSelectInviteeFields } },
      });
    });

    it("should create a task and connect invitee if inviteeEmail is provided and valid", async () => {
      const taskData = {
        title: "Test Task with Invitee",
        inviteeEmail: "invitee@example.com",
      };
      const ownerId = "usr-1";
      const inviteeUser = { id: "usr-invitee", email: "invitee@example.com" };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: ownerId, email: "owner@example.com" })
        .mockResolvedValueOnce(inviteeUser);

      (prisma.task.create as jest.Mock).mockResolvedValue({
        id: "task-with-invitee",
        ...taskData,
        userId: ownerId,
        inviteeId: inviteeUser.id,
        invitee: inviteeUser,
      });

      await createTask(taskData, ownerId);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: ownerId },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "invitee@example.com" },
      });
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "Test Task with Invitee",
          completed: false,
          user: { connect: { id: ownerId } },
          invitee: { connect: { id: inviteeUser.id } },
        },
        include: { invitee: { select: mockSelectInviteeFields } },
      });
    });

    it("should create a task without invitee if inviteeEmail is owner's email", async () => {
      const taskData = {
        title: "Test Task Self Invite",
        inviteeEmail: "owner@example.com",
      };
      const ownerId = "usr-1";

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: ownerId,
        email: "owner@example.com",
      });

      (prisma.task.create as jest.Mock).mockResolvedValue({
        id: "task-self-invite",
        ...taskData,
        userId: ownerId,
        invitee: null,
      });

      await createTask(taskData, ownerId);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: ownerId },
      });
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "Test Task Self Invite",
          completed: false,
          user: { connect: { id: ownerId } },
        },
        include: { invitee: { select: mockSelectInviteeFields } },
      });
    });

    it("should create a task without invitee if inviteeEmail is not found", async () => {
      const taskData = {
        title: "Test Task Invalid Invitee",
        inviteeEmail: "nonexistent@example.com",
      };
      const ownerId = "usr-1";

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: ownerId, email: "owner@example.com" })
        .mockResolvedValueOnce(null);

      (prisma.task.create as jest.Mock).mockResolvedValue({
        id: "task-invalid-invitee",
        ...taskData,
        userId: ownerId,
        invitee: null,
      });

      await createTask(taskData, ownerId);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: ownerId },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "nonexistent@example.com" },
      });
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "Test Task Invalid Invitee",
          completed: false,
          user: { connect: { id: ownerId } },
        },
        include: { invitee: { select: mockSelectInviteeFields } },
      });
    });
  });

  describe("getAllTasks", () => {
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Task 1",
        description: "First task",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "usr-1",
        inviteeId: null,
      },
      {
        id: "2",
        title: "Task 2",
        description: "Second task",
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "usr-1",
        inviteeId: null,
      },
    ];

    it("should return paginated tasks with default parameters", async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.task.count as jest.Mock).mockResolvedValue(mockTasks.length);

      const result = await getAllTasks("usr-1");

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { OR: [{ userId: "usr-1" }, { inviteeId: "usr-1" }] },
        orderBy: { createdAt: "desc" },
        include: { invitee: { select: mockSelectInviteeFields } },
      });
      expect(prisma.task.count).toHaveBeenCalledWith({
        where: { OR: [{ userId: "usr-1" }, { inviteeId: "usr-1" }] },
      });
      expect(result).toEqual<PaginatedTasksResponse>({
        tasks: mockTasks,
        total: mockTasks.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(mockTasks.length / 10),
      });
    });

    it("should apply pagination parameters", async () => {
      const params: GetAllTasksParams = { page: 2, limit: 5 };
      const userId = "usr-1";
      (prisma.task.findMany as jest.Mock).mockResolvedValue(
        mockTasks.slice(0, 5)
      );
      (prisma.task.count as jest.Mock).mockResolvedValue(10);

      const result = await getAllTasks(userId, params);

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        where: { OR: [{ userId: userId }, { inviteeId: userId }] },
        orderBy: { createdAt: "desc" },
        include: { invitee: { select: mockSelectInviteeFields } },
      });
      expect(prisma.task.count).toHaveBeenCalledWith({
        where: { OR: [{ userId: userId }, { inviteeId: userId }] },
      });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.total).toBe(10);
      expect(result.totalPages).toBe(2);
    });

    it("should apply sorting parameters", async () => {
      const params: GetAllTasksParams = { sortBy: "title", sortOrder: "asc" };
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.task.count as jest.Mock).mockResolvedValue(mockTasks.length);

      await getAllTasks("usr-1", params);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { title: "asc" },
        })
      );
    });

    it("should apply filtering for completed tasks", async () => {
      const params: GetAllTasksParams = { completed: "true" };
      (prisma.task.findMany as jest.Mock).mockResolvedValue(
        mockTasks.filter((t) => t.completed)
      );
      (prisma.task.count as jest.Mock).mockResolvedValue(1);

      await getAllTasks("usr-1", params);
      const expectedWhere = {
        completed: true,
        OR: [{ userId: "usr-1" }, { inviteeId: "usr-1" }],
      };
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
          include: { invitee: { select: mockSelectInviteeFields } },
          orderBy: { createdAt: "desc" },
          skip: 0,
          take: 10,
        })
      );
      expect(prisma.task.count).toHaveBeenCalledWith({ where: expectedWhere });
    });

    it("should apply filtering for incomplete tasks", async () => {
      const params: GetAllTasksParams = { completed: "false" };
      (prisma.task.findMany as jest.Mock).mockResolvedValue(
        mockTasks.filter((t) => !t.completed)
      );
      (prisma.task.count as jest.Mock).mockResolvedValue(1);

      await getAllTasks("usr-1", params);
      const expectedWhere = {
        completed: false,
        OR: [{ userId: "usr-1" }, { inviteeId: "usr-1" }],
      };
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        })
      );
      expect(prisma.task.count).toHaveBeenCalledWith({ where: expectedWhere });
    });

    it("should not filter by completed if 'all' is specified", async () => {
      const params: GetAllTasksParams = { completed: "all" };
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.task.count as jest.Mock).mockResolvedValue(mockTasks.length);

      await getAllTasks("usr-1", params);
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: [{ userId: "usr-1" }, { inviteeId: "usr-1" }] },
        })
      );
      expect(prisma.task.count).toHaveBeenCalledWith({
        where: { OR: [{ userId: "usr-1" }, { inviteeId: "usr-1" }] },
      });
    });

    it("should apply search filter for title and description", async () => {
      const params: GetAllTasksParams = { search: "TestSearch" };
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.task.count as jest.Mock).mockResolvedValue(0);

      await getAllTasks("usr-1", params);
      const expectedWhere = {
        OR: [
          { title: { contains: "TestSearch", mode: "insensitive" } },
          { description: { contains: "TestSearch", mode: "insensitive" } },
        ],
      };
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        })
      );
      expect(prisma.task.count).toHaveBeenCalledWith({ where: expectedWhere });
    });

    it("should combine multiple filters (e.g., completed and search)", async () => {
      const params: GetAllTasksParams = { completed: "true", search: "Task 2" };
      (prisma.task.findMany as jest.Mock).mockResolvedValue([mockTasks[1]]);
      (prisma.task.count as jest.Mock).mockResolvedValue(1);

      await getAllTasks("usr-1", params);
      const expectedWhere = {
        completed: true,
        OR: [
          { title: { contains: "Task 2", mode: "insensitive" } },
          { description: { contains: "Task 2", mode: "insensitive" } },
        ],
      };
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        })
      );
      expect(prisma.task.count).toHaveBeenCalledWith({ where: expectedWhere });
    });
  });

  describe("getTaskById", () => {
    it("should return a task by id if user is owner", async () => {
      const taskId = "1";
      const userId = "usr-1";
      const expectedTask: Task = {
        id: taskId,
        title: "Test Task",
        description: "",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId,
        inviteeId: null,
      };
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(expectedTask);

      const result = await getTaskById(taskId, userId);
      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId: userId },
        include: { invitee: { select: mockSelectInviteeFields } },
      });
      expect(result).toEqual(expectedTask);
    });

    it("should return null if task not found or user not authorized", async () => {
      const taskId = "non-existent-id";
      const userId = "usr-1";
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getTaskById(taskId, userId);
      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId: userId },
        include: { invitee: { select: mockSelectInviteeFields } },
      });
      expect(result).toBeNull();
    });
  });

  describe("updateTask", () => {
    it("should update an existing task by owner", async () => {
      const taskId = "1";
      const userId = "usr-1";
      const updateData = { title: "Updated Task", completed: true };
      const mockExistingTask: Task & { user: Partial<User> | null } = {
        id: taskId,
        title: "Old Title",
        description: "Old description",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId,
        inviteeId: null,
        user: { email: "owner@example.com" },
      };
      const expectedTask = {
        ...mockExistingTask,
        ...updateData,
        updatedAt: new Date(),
      } as Task;

      (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockExistingTask);
      (prisma.task.update as jest.Mock).mockResolvedValue(expectedTask);

      const result = await updateTask(taskId, updateData, userId);

      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId: userId },
        include: { user: { select: { email: true } } },
      });
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updateData,
        include: { invitee: { select: mockSelectInviteeFields } },
      });
      expect(result).toEqual(expectedTask);
    });

    it("should return null if task to update is not found or not owned by user", async () => {
      const taskId = "non-existent-id";
      const userId = "usr-1";
      const updateData = { title: "Updated Task" };
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await updateTask(taskId, updateData, userId);
      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId: userId },
        include: { user: { select: { email: true } } },
      });
      expect(prisma.task.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should throw an error for other errors during update if task is found", async () => {
      const taskId = "1";
      const userId = "usr-1";
      const updateData = { title: "Updated Task" };
      const mockExistingTask = {
        id: taskId,
        userId: userId,
        user: { email: "owner@example.com" },
      };
      const error = new Error("Some other error");

      (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockExistingTask);
      (prisma.task.update as jest.Mock).mockRejectedValue(error);

      await expect(updateTask(taskId, updateData, userId)).rejects.toThrow(
        "Some other error"
      );
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updateData,
        include: { invitee: { select: mockSelectInviteeFields } },
      });
    });
  });

  describe("deleteTask", () => {
    it("should delete an existing task by owner", async () => {
      const taskId = "1";
      const userId = "usr-1";
      const expectedTask: Task = {
        id: taskId,
        title: "Test Task",
        description: "",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId,
        inviteeId: null,
      };
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(expectedTask);
      (prisma.task.delete as jest.Mock).mockResolvedValue(expectedTask);

      const result = await deleteTask(taskId, userId);
      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId: userId },
      });
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toEqual(expectedTask);
    });

    it("should return null if task to delete is not found or not owned by user", async () => {
      const taskId = "non-existent-id";
      const userId = "usr-1";
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await deleteTask(taskId, userId);
      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId: userId },
      });
      expect(prisma.task.delete).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
