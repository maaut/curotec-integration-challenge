export interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  invitee?: {
    id: string;
    email: string;
  } | null;
}

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
