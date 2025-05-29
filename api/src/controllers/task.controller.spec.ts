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
import { PaginatedTasksResponse, GetAllTasksParams } from "../types/task.types";

jest.mock("../services/task.service");

const mockRequest = (body: any = {}, params: any = {}, query: any = {}) =>
  ({
    body,
    params,
    query,
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
    it("should return paginated tasks and status 200 with default params", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const mockServiceResponse: PaginatedTasksResponse = {
        tasks: [
          {
            id: "1",
            title: "Test Task",
            description: "",
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      (TaskService.getAllTasks as jest.Mock).mockResolvedValue(
        mockServiceResponse
      );

      await getAllTasksController(req, res);

      expect(TaskService.getAllTasks).toHaveBeenCalledWith({});
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it("should pass query parameters to TaskService.getAllTasks and return paginated response", async () => {
      const queryParams: GetAllTasksParams = {
        page: 2,
        limit: 5,
        sortBy: "title",
        sortOrder: "asc",
        completed: "true",
        search: "findme",
      };
      const req = mockRequest({}, {}, queryParams);
      const res = mockResponse();
      const mockServiceResponse: PaginatedTasksResponse = {
        tasks: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      };
      (TaskService.getAllTasks as jest.Mock).mockResolvedValue(
        mockServiceResponse
      );

      await getAllTasksController(req, res);

      const expectedServiceParams: GetAllTasksParams = {
        page: 2,
        limit: 5,
        sortBy: "title",
        sortOrder: "asc",
        completed: "true",
        search: "findme",
      };

      expect(TaskService.getAllTasks).toHaveBeenCalledWith(
        expectedServiceParams
      );
      expect(res.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it("should handle partial query parameters correctly", async () => {
      const queryParams = { page: "3", completed: "false" };
      const req = mockRequest({}, {}, queryParams);
      const res = mockResponse();
      const mockServiceResponse: PaginatedTasksResponse = {
        tasks: [],
        total: 0,
        page: 3,
        limit: 10,
        totalPages: 0,
      };
      (TaskService.getAllTasks as jest.Mock).mockResolvedValue(
        mockServiceResponse
      );

      await getAllTasksController(req, res);

      const expectedServiceParams: Partial<GetAllTasksParams> = {
        page: 3,
        completed: "false",
      };

      expect(TaskService.getAllTasks).toHaveBeenCalledWith(
        expectedServiceParams
      );
      expect(res.json).toHaveBeenCalledWith(mockServiceResponse);
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
