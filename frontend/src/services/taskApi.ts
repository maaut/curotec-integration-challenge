import axios, { AxiosError } from "axios";
import type {
  Task,
  GetAllTasksParams,
  PaginatedTasksResponse,
} from "../types/task.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const handleError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    return new Error(
      axiosError.response?.data?.errors[0]?.message ||
        axiosError.response?.data?.message ||
        "An unknown API error occurred"
    );
  }

  return new Error("An unexpected error occurred");
};

export const taskApi = {
  getAllTasks: async (
    params?: GetAllTasksParams
  ): Promise<PaginatedTasksResponse> => {
    try {
      const response = await apiClient.get<PaginatedTasksResponse>("/tasks", {
        params,
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  getTaskById: async (id: string): Promise<Task> => {
    try {
      const response = await apiClient.get<Task>(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  addTask: async (
    taskData: Omit<Task, "id" | "completed" | "createdAt" | "updatedAt">
  ): Promise<Task> => {
    try {
      const response = await apiClient.post<Task>("/tasks", taskData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  updateTask: async (
    id: string,
    taskData: Partial<
      Omit<Task, "id" | "completed" | "createdAt" | "updatedAt">
    >
  ): Promise<Task> => {
    try {
      const response = await apiClient.put<Task>(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  deleteTask: async (id: string): Promise<{ message: string }> => {
    try {
      await apiClient.delete(`/tasks/${id}`);
      return { message: "Task deleted successfully" };
    } catch (error) {
      throw handleError(error);
    }
  },
};
