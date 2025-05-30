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
      const taskDto: CreateTaskDto = {
        title: "Test Task",
        description: "Test Desc",
      };
      const userId = "usr-test-1";
      const req = mockRequest(taskDto); // body
      req.user = { id: userId, email: "test@example.com" };

      const res = mockResponse();
      const expectedServiceResponse = {
        id: "1",
        ...taskDto,
        completed: false,
        userId,
      };
      (TaskService.createTask as jest.Mock).mockResolvedValue(
        expectedServiceResponse
      );

      await createTaskController(req as Request<{}, {}, CreateTaskDto>, res);

      expect(TaskService.createTask).toHaveBeenCalledWith(taskDto, userId);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expectedServiceResponse);
    });

    it("should return 400 if title is missing", async () => {
      const req = mockRequest({});
      req.user = { id: "usr-test-1", email: "test@example.com" };
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
      req.user = { id: "usr-test-1", email: "test@example.com" };
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
      const userId = "usr-1";
      req.user = { id: userId, email: "test@example.com" };
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
            userId: userId,
            inviteeId: null,
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

      // The controller will call the service with an empty object for params if none are provided in query
      // or an object where all values are undefined, which then get stripped.
      expect(TaskService.getAllTasks).toHaveBeenCalledWith(userId, {});
      // expect(res.status).toHaveBeenCalledWith(200); // res.json implies 200 by default if not set
      expect(res.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it("should pass query parameters to TaskService.getAllTasks and return paginated response", async () => {
      const queryParams = {
        page: "2", // Query params are strings
        limit: "5", // Query params are strings
        sortBy: "title",
        sortOrder: "asc",
        completed: "true",
        search: "findme",
      };
      const userId = "usr-test-query";
      const req = mockRequest({}, {}, queryParams);
      req.user = { id: userId, email: "test@example.com" };
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

      // Controller parses page and limit to numbers
      const expectedServiceParams: GetAllTasksParams = {
        page: 2, // Parsed to number
        limit: 5, // Parsed to number
        sortBy: "title",
        sortOrder: "asc",
        completed: "true",
        search: "findme",
      };

      expect(TaskService.getAllTasks).toHaveBeenCalledWith(
        userId,
        expectedServiceParams
      );
      expect(res.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it("should handle partial query parameters correctly", async () => {
      const queryParams = { page: "3", completed: "false" };
      const userId = "usr-1"; // Define userId to be used
      // Pass empty object for body, then set req.user directly
      const req = mockRequest({}, {}, queryParams);
      req.user = { id: userId, email: "test@example.com" }; // Correctly mock req.user
      const res = mockResponse();
      const mockServiceResponse: PaginatedTasksResponse = {
        tasks: [],
        total: 0,
        page: 3,
        limit: 10, // Default limit if not provided
        totalPages: 0,
      };
      (TaskService.getAllTasks as jest.Mock).mockResolvedValue(
        mockServiceResponse
      );

      await getAllTasksController(req, res);

      const expectedServiceParams: Partial<GetAllTasksParams> = {
        page: 3, // Parsed to number
        completed: "false",
        // Other params will be undefined and stripped by controller logic
      };

      expect(TaskService.getAllTasks).toHaveBeenCalledWith(
        userId, // Use the defined userId
        expectedServiceParams
      );
      expect(res.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it("should return 500 if service throws an error", async () => {
      const req = mockRequest();
      req.user = { id: "usr-err-test", email: "test@example.com" };
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
      const taskId = "1";
      const userId = "usr-1";
      const req = mockRequest({}, { id: taskId });
      req.user = { id: userId, email: "test@example.com" };
      const res = mockResponse();
      const task = { id: taskId, title: "Test Task", completed: false, userId };
      (TaskService.getTaskById as jest.Mock).mockResolvedValue(task);

      await getTaskByIdController(req as Request<{ id: string }>, res);

      expect(TaskService.getTaskById).toHaveBeenCalledWith(taskId, userId);
      expect(res.json).toHaveBeenCalledWith(task);
    });

    it("should return 404 if task not found", async () => {
      const req = mockRequest({}, { id: "1" });
      req.user = { id: "usr-del-err", email: "test@example.com" };

      const res = mockResponse();
      (TaskService.getTaskById as jest.Mock).mockResolvedValue(null);

      await getTaskByIdController(req as Request<{ id: string }>, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Task not found or not owned by user",
      });
    });

    it("should return 500 if service throws an error", async () => {
      const req = mockRequest({}, { id: "1" });
      req.user = { id: "usr-del-err", email: "test@example.com" };

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
      const taskId = "1";
      const userId = "usr-del-err";
      const updateDto: UpdateTaskDto = { title: "Updated Task" };
      const req = mockRequest(updateDto, { id: taskId });
      req.user = { id: userId, email: "test@example.com" };

      const res = mockResponse();
      // The service is expected to return the full task object after update
      const expectedServiceResponse = {
        id: taskId,
        ...updateDto,
        completed: false,
        userId,
      };
      (TaskService.updateTask as jest.Mock).mockResolvedValue(
        expectedServiceResponse
      );

      await updateTaskController(
        req as Request<{ id: string }, {}, UpdateTaskDto>,
        res
      );

      // Expect service to be called with taskId, the DTO from req.body, and userId
      expect(TaskService.updateTask).toHaveBeenCalledWith(
        taskId,
        updateDto,
        userId
      );
      expect(res.json).toHaveBeenCalledWith(expectedServiceResponse);
    });

    it("should return 404 if task not found", async () => {
      const req = mockRequest({ title: "Updated Task" }, { id: "1" });
      req.user = { id: "usr-del-err", email: "test@example.com" };

      const res = mockResponse();
      (TaskService.updateTask as jest.Mock).mockResolvedValue(null);

      await updateTaskController(
        req as Request<{ id: string }, {}, UpdateTaskDto>,
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Task not found or not owned by user",
      });
    });

    it("should return 500 if service throws an error", async () => {
      const req = mockRequest({ title: "Updated Task" }, { id: "1" });
      req.user = { id: "usr-del-err", email: "test@example.com" };

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
    it("should delete a task and return 200", async () => {
      const taskId = "1";
      const userId = "usr-del-err";
      const req = mockRequest({}, { id: taskId });
      req.user = { id: userId, email: "test@example.com" };

      const res = mockResponse();
      const mockDeletedTask = {
        id: taskId,
        title: "Test Task",
        // other fields if your service returns them, though controller only uses id and title here
      };
      (TaskService.deleteTask as jest.Mock).mockResolvedValue(mockDeletedTask);

      await deleteTaskController(req as Request<{ id: string }>, res);

      expect(TaskService.deleteTask).toHaveBeenCalledWith(taskId, userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Task deleted successfully",
        task: mockDeletedTask, // Include the task object in the expectation
      });
    });

    it("should return 404 if task not found", async () => {
      const req = mockRequest({}, { id: "1" });
      req.user = { id: "usr-del-err", email: "test@example.com" };

      const res = mockResponse();
      (TaskService.deleteTask as jest.Mock).mockResolvedValue(null);

      await deleteTaskController(req as Request<{ id: string }>, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Task not found or not owned by user",
      });
    });

    it("should return 500 if service throws an error", async () => {
      const req = mockRequest({}, { id: "1" });
      req.user = { id: "usr-del-err", email: "test@example.com" };
      const res = mockResponse();
      (TaskService.deleteTask as jest.Mock).mockRejectedValueOnce(
        new Error("Failed to delete")
      );

      await deleteTaskController(req as Request<{ id: string }>, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to delete task",
      });
    });
  });
});
