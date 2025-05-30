import { createContext } from "react";
import type { Task } from "../types/task.types";
import type { TasksManagerState } from "../hooks/useTaskManager";

export interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  tasksState: TasksManagerState;
  fetchTasks: (newState?: Partial<TasksManagerState>) => Promise<void>;
  addTask: (
    taskData: Omit<
      Task,
      "id" | "completed" | "createdAt" | "updatedAt" | "userId" | "invitee"
    > & {
      description?: string;
      inviteeEmail?: string;
    }
  ) => Promise<void>;
  updateTask: (
    taskId: string,
    taskData: Partial<
      Omit<
        Task,
        "id" | "createdAt" | "updatedAt" | "userId" | "invitee" | "inviteeEmail"
      >
    >
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  setTasksState: (newState: Partial<TasksManagerState>) => void;
  inviteToTask: (taskId: string, inviteeEmail: string) => Promise<void>;
  uninviteFromTask: (taskId: string) => Promise<void>;
  contextHolder: React.ReactElement;
}

export const TaskContext = createContext<TaskContextType | undefined>(
  undefined
);
