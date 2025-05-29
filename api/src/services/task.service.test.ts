import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "./task.service";
import { PrismaClient, Task } from "../../generated/prisma";

jest.mock("../../generated/prisma", () => {
  const mPrismaClient = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

      const result = await createTask(taskData);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: { ...taskData, completed: false },
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

      await createTask(taskData);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: { title: "Test Task", completed: false },
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
      await createTask(taskData);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: { title: "Test Task", completed: true },
      });
    });
  });

  describe("getAllTasks", () => {
    it("should return all tasks", async () => {
      const expectedTasks: Task[] = [
        {
          id: "1",
          title: "Task 1",
          description: "",
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          title: "Task 2",
          description: "",
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      (prisma.task.findMany as jest.Mock).mockResolvedValue(expectedTasks);

      const result = await getAllTasks();
      expect(prisma.task.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedTasks);
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
      };
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(expectedTask);

      const result = await getTaskById(taskId);
      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toEqual(expectedTask);
    });

    it("should return null if task not found", async () => {
      const taskId = "non-existent-id";
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getTaskById(taskId);
      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toBeNull();
    });
  });

  describe("updateTask", () => {
    it("should update an existing task", async () => {
      const taskId = "1";
      const updateData = { title: "Updated Task", completed: true };
      const expectedTask: Task = {
        id: taskId,
        title: "Updated Task",
        description: "",
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.task.update as jest.Mock).mockResolvedValue(expectedTask);

      const result = await updateTask(taskId, updateData);
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

      const result = await updateTask(taskId, updateData);
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

      await expect(updateTask(taskId, updateData)).rejects.toThrow(
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
      };
      (prisma.task.delete as jest.Mock).mockResolvedValue(expectedTask);

      const result = await deleteTask(taskId);
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toEqual(expectedTask);
    });

    it("should return null if task to delete is not found", async () => {
      const taskId = "non-existent-id";
      (prisma.task.delete as jest.Mock).mockRejectedValue({ code: "P2025" });

      const result = await deleteTask(taskId);
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toBeNull();
    });

    it("should throw an error for other errors during delete", async () => {
      const taskId = "1";
      const error = new Error("Some other error");
      (prisma.task.delete as jest.Mock).mockRejectedValue(error);

      await expect(deleteTask(taskId)).rejects.toThrow("Some other error");
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });
  });
});
