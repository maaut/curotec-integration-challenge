import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "./task.service";
import { PrismaClient, Task } from "../../generated/prisma";
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
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient();

describe("Task Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      };
      (prisma.task.create as jest.Mock).mockResolvedValue(expectedTask);

      const result = await createTask(taskData, "usr-1");
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          ...taskData,
          completed: false,
          user: { connect: { id: "usr-1" } },
        },
      });
      expect(result).toEqual(expectedTask);
    });

    it("should throw an error if title is missing", async () => {
      const taskData = { description: "Test Description" };
      // @ts-ignore
      await expect(createTask(taskData)).rejects.toThrow("Title is required");
      expect(prisma.task.create).not.toHaveBeenCalled();
    });

    it("should set completed to false if not provided", async () => {
      const taskData = { title: "Test Task" };
      const expectedTask = {
        id: "1",
        ...taskData,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.task.create as jest.Mock).mockResolvedValue(expectedTask);

      await createTask(taskData, "usr-1");
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "Test Task",
          completed: false,
          user: { connect: { id: "usr-1" } },
        },
      });
    });

    it("should use provided completed status", async () => {
      const taskData = { title: "Test Task", completed: true };
      const expectedTask = {
        id: "1",
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.task.create as jest.Mock).mockResolvedValue(expectedTask);
      await createTask(taskData, "usr-1");
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: "Test Task",
          completed: true,
          user: { connect: { id: "usr-1" } },
        },
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
      },
      {
        id: "2",
        title: "Task 2",
        description: "Second task",
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "usr-1",
      },
    ];

    it("should return paginated tasks with default parameters", async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.task.count as jest.Mock).mockResolvedValue(mockTasks.length);

      const result = await getAllTasks("usr-1");

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { userId: "usr-1" },
        orderBy: { createdAt: "desc" },
      });
      expect(prisma.task.count).toHaveBeenCalledWith({
        where: {
          userId: "usr-1",
        },
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
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      expect(prisma.task.count).toHaveBeenCalledWith({ where: { userId } });
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
      const expectedWhere = { completed: true, userId: "usr-1" };
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
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
      const expectedWhere = { completed: false, userId: "usr-1" };
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
          where: { userId: "usr-1" },
        })
      );
      expect(prisma.task.count).toHaveBeenCalledWith({
        where: {
          userId: "usr-1",
        },
      });
    });

    it("should apply search filter for title and description", async () => {
      const params: GetAllTasksParams = { search: "TestSearch" };
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.task.count as jest.Mock).mockResolvedValue(0);

      await getAllTasks("usr-1", params);
      const expectedWhere = {
        userId: "usr-1",
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
        userId: "usr-1",
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
    it("should return a task by id", async () => {
      const taskId = "1";
      const expectedTask: Task = {
        id: taskId,
        title: "Test Task",
        description: "",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "usr-1",
      };
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(expectedTask);

      const result = await getTaskById(taskId, "usr-1");
      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId: "usr-1" },
      });
      expect(result).toEqual(expectedTask);
    });

    it("should return null if task not found", async () => {
      const taskId = "non-existent-id";
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getTaskById(taskId, "usr-1");
      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId: "usr-1" },
      });
      expect(result).toBeNull();
    });
  });

  describe("updateTask", () => {
    it("should update an existing task", async () => {
      const taskId = "1";
      const userId = "usr-1";
      const updateData = { title: "Updated Task", completed: true };
      const mockExistingTask: Task = {
        id: taskId,
        title: "Old Title",
        description: "Old description",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: userId,
      };
      const expectedTask: Task = {
        ...mockExistingTask,
        ...updateData,
        updatedAt: new Date(),
      };

      (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockExistingTask);
      (prisma.task.update as jest.Mock).mockResolvedValue(expectedTask);

      const result = await updateTask(taskId, updateData, userId);

      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId: userId },
      });
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updateData,
      });
      expect(result).toEqual(expectedTask);
    });

    it("should return null if task to update is not found", async () => {
      const taskId = "non-existent-id";
      const updateData = { title: "Updated Task" };
      (prisma.task.update as jest.Mock).mockRejectedValue({ code: "P2025" });

      const result = await updateTask(taskId, updateData, "usr-1");
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updateData,
      });
      expect(result).toBeNull();
    });

    it("should throw an error for other errors during update", async () => {
      const taskId = "1";
      const updateData = { title: "Updated Task" };
      const error = new Error("Some other error");
      (prisma.task.update as jest.Mock).mockRejectedValue(error);

      await expect(updateTask(taskId, updateData, "usr-1")).rejects.toThrow(
        "Some other error"
      );
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updateData,
      });
    });
  });

  describe("deleteTask", () => {
    it("should delete an existing task", async () => {
      const taskId = "1";
      const expectedTask: Task = {
        id: taskId,
        title: "Test Task",
        description: "",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "usr-1",
      };
      (prisma.task.delete as jest.Mock).mockResolvedValue(expectedTask);

      const result = await deleteTask(taskId, "usr-1");
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toEqual(expectedTask);
    });

    it("should return null if task to delete is not found", async () => {
      const taskId = "non-existent-id";
      (prisma.task.delete as jest.Mock).mockRejectedValue({ code: "P2025" });

      const result = await deleteTask(taskId, "usr-1");
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toBeNull();
    });

    it("should throw an error for other errors during delete", async () => {
      const taskId = "1";
      (prisma.task.delete as jest.Mock).mockResolvedValue(null);

      await deleteTask(taskId, "usr-1");
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });
  });
});
