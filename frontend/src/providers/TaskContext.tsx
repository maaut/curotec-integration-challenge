import React, { createContext, useContext, type ReactNode } from "react";
import type { Task } from "../types/task.types";
import {
  useTaskManager,
  type TasksManagerState,
} from "../hooks/useTaskManager";

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  tasksState: TasksManagerState;
  fetchTasks: (newState?: Partial<TasksManagerState>) => Promise<void>;
  addTask: (
    task: Omit<Task, "id" | "completed" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  setTasksState: (newState: Partial<TasksManagerState>) => void;
  contextHolder: React.ReactElement;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const taskManager = useTaskManager();

  return (
    <TaskContext.Provider value={taskManager}>
      {taskManager.contextHolder}
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
