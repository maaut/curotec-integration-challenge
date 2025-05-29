import { Request, Response } from "express";
import * as TaskService from "../services/task.service";
import {
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
} from "./task.controller";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";

jest.mock("../services/task.service");

const mockRequest = (body: any = {}, params: any = {}) =>
  ({
    body,
    params,
  } as Request<any, {}, any, any>);

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("Task Controller", () => {
  describe("createTaskController", () => {
    it("should create a task and return 201", async () => {
      const req = mockRequest({ title: "Test Task" });
      const res = mockResponse();
      const task = { id: "1", title: "Test Task", completed: false };
      (TaskService.createTask as jest.Mock).mockResolvedValue(task);

      await createTaskController(req as Request<{}, {}, CreateTaskDto>, res);

      expect(TaskService.createTask).toHaveBeenCalledWith({
        title: "Test Task",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(task);
    });

    it("should return 400 if title is missing", async () => {
      const req = mockRequest({});
      const res = mockResponse();
      (TaskService.createTask as jest.Mock).mockRejectedValueOnce(
        new Error("Title is required")
      );

      await createTaskController(req as Request<{}, {}, CreateTaskDto>, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Title is required" });
    });

    it("should return 500 if service throws an unexpected error", async () => {
      const req = mockRequest({ title: "Test Task" });
      const res = mockResponse();
      (TaskService.createTask as jest.Mock).mockRejectedValueOnce(
        new Error("Unexpected error")
      );

      await createTaskController(req as Request<{}, {}, CreateTaskDto>, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "An unexpected error occurred while creating the task",
      });
    });
  });

  describe("getAllTasksController", () => {
    it("should return all tasks and status 200", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const tasks = [{ id: "1", title: "Test Task", completed: false }];
      (TaskService.getAllTasks as jest.Mock).mockResolvedValue(tasks);

      await getAllTasksController(req, res);

      expect(TaskService.getAllTasks).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(tasks);
    });

    it("should return 500 if service throws an error", async () => {
      const req = mockRequest();
      const res = mockResponse();
      (TaskService.getAllTasks as jest.Mock).mockRejectedValueOnce(
        new Error("Failed to retrieve")
      );

      await getAllTasksController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve tasks",
      });
    });
  });

  describe("getTaskByIdController", () => {
    it("should return a task by id and status 200", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();
      const task = { id: "1", title: "Test Task", completed: false };
      (TaskService.getTaskById as jest.Mock).mockResolvedValue(task);

      await getTaskByIdController(req as Request<{ id: string }>, res);

      expect(TaskService.getTaskById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(task);
    });

    it("should return 404 if task not found", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();
      (TaskService.getTaskById as jest.Mock).mockResolvedValue(null);

      await getTaskByIdController(req as Request<{ id: string }>, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
    });

    it("should return 500 if service throws an error", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();
      (TaskService.getTaskById as jest.Mock).mockRejectedValueOnce(
        new Error("Failed to retrieve")
      );

      await getTaskByIdController(req as Request<{ id: string }>, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve task",
      });
    });
  });

  describe("updateTaskController", () => {
    it("should update a task and return 200", async () => {
      const req = mockRequest({ title: "Updated Task" }, { id: "1" });
      const res = mockResponse();
      const task = { id: "1", title: "Updated Task", completed: false };
      (TaskService.updateTask as jest.Mock).mockResolvedValue(task);

      await updateTaskController(
        req as Request<{ id: string }, {}, UpdateTaskDto>,
        res
      );

      expect(TaskService.updateTask).toHaveBeenCalledWith("1", {
        title: "Updated Task",
      });
      expect(res.json).toHaveBeenCalledWith(task);
    });

    it("should return 404 if task not found", async () => {
      const req = mockRequest({ title: "Updated Task" }, { id: "1" });
      const res = mockResponse();
      (TaskService.updateTask as jest.Mock).mockResolvedValue(null);

      await updateTaskController(
        req as Request<{ id: string }, {}, UpdateTaskDto>,
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
    });

    it("should return 500 if service throws an error", async () => {
      const req = mockRequest({ title: "Updated Task" }, { id: "1" });
      const res = mockResponse();
      (TaskService.updateTask as jest.Mock).mockRejectedValueOnce(
        new Error("Failed to update")
      );

      await updateTaskController(
        req as Request<{ id: string }, {}, UpdateTaskDto>,
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to update task" });
    });
  });

  describe("deleteTaskController", () => {
    it("should delete a task and return 204", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();
      (TaskService.deleteTask as jest.Mock).mockResolvedValue({
        id: "1",
        title: "Test Task",
      });

      await deleteTaskController(req as Request<{ id: string }>, res);

      expect(TaskService.deleteTask).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith("Task deleted successfully");
    });

    it("should return 404 if task not found", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();
      (TaskService.deleteTask as jest.Mock).mockResolvedValue(null);

      await deleteTaskController(req as Request<{ id: string }>, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
    });

    it("should return 500 if service throws an error", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();
      (TaskService.deleteTask as jest.Mock).mockRejectedValueOnce(
        new Error("Failed to delete")
      );

      await deleteTaskController(req as Request<{ id: string }>, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete task" });
    });
  });
});
