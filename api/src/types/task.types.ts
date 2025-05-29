import type { Task } from "../../generated/prisma";

export interface GetAllTasksParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  completed?: "true" | "false" | "all";
  search?: string;
}

export interface PaginatedTasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
