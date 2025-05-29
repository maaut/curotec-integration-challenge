import apiClient from "./axiosConfig";
import type {
  Task,
  GetAllTasksParams,
  PaginatedTasksResponse,
} from "../types/task.types";

export const fetchTasks = async (
  params?: GetAllTasksParams
): Promise<PaginatedTasksResponse> => {
  const response = await apiClient.get<PaginatedTasksResponse>("/tasks", {
    params,
  });
  return response.data;
};

export const createTask = async (taskData: {
  title: string;
  description?: string;
}): Promise<Task> => {
  const response = await apiClient.post<Task>("/tasks", taskData);
  return response.data;
};

export const updateTask = async (
  id: string,
  taskData: Partial<Task>
): Promise<Task> => {
  const {
    id: taskId,
    createdAt,
    updatedAt,
    userId,
    ...restOfTaskData
  } = taskData as any;
  const response = await apiClient.put<Task>(`/tasks/${id}`, restOfTaskData);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};

export const toggleTaskCompletion = async (
  id: string,
  completed: boolean
): Promise<Task> => {
  const response = await apiClient.put<Task>(`/tasks/${id}/toggle`, {
    completed,
  });
  return response.data;
};

export const getTaskById = async (id: string): Promise<Task> => {
  const response = await apiClient.get<Task>(`/tasks/${id}`);
  return response.data;
};
