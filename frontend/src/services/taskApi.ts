import axios, { AxiosError } from "axios";
import type { Task } from "../types/task.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface ApiError {
  message: string;
  status?: number;
}

const handleError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    console.error(
      "API Error:",
      axiosError.response?.data || axiosError.message
    );
    return {
      message:
        axiosError.response?.data?.error ||
        axiosError.message ||
        "An unknown API error occurred",
      status: axiosError.response?.status,
    };
  }
  console.error("Unexpected Error:", error);
  return { message: "An unexpected error occurred" };
};

export const getAllTasks = async (): Promise<Task[] | ApiError> => {
  try {
    const response = await apiClient.get<Task[]>("/tasks");
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getTaskById = async (id: string): Promise<Task | ApiError> => {
  try {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const createTask = async (
  taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
): Promise<Task | ApiError> => {
  try {
    const response = await apiClient.post<Task>("/tasks", taskData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateTask = async (
  id: string,
  taskData: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>
): Promise<Task | ApiError> => {
  try {
    const response = await apiClient.put<Task>(`/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteTask = async (
  id: string
): Promise<{ message: string } | ApiError> => {
  try {
    await apiClient.delete(`/tasks/${id}`);
    return { message: "Task deleted successfully" };
  } catch (error) {
    return handleError(error);
  }
};
