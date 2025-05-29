import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import { taskApi } from "../services/taskApi";
import type { Task } from "../types/task.types";
import { message } from "antd";

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (
    task: Omit<Task, "id" | "completed" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);
export const TaskProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messageApi, contextHolder] = message.useMessage();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await taskApi.getAllTasks();
      setTasks(fetchedTasks);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to fetch tasks";
      setError(errorMessage);
      messageApi.error(errorMessage);
    }
    setLoading(false);
  }, []);

  const addTask = async (
    taskData: Omit<Task, "id" | "completed" | "createdAt" | "updatedAt">
  ) => {
    setLoading(true);
    setError(null);
    try {
      const newTask = await taskApi.addTask(taskData);
      setTasks((prevTasks) => [...prevTasks, newTask]);
      messageApi.success("Task added successfully!");
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to add task";
      setError(errorMessage);
      messageApi.error(errorMessage);
    }
    setLoading(false);
  };

  const updateTask = async (updatedTaskData: Task) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await taskApi.updateTask(
        updatedTaskData.id,
        updatedTaskData
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
      messageApi.success("Task updated successfully!");
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to update task";
      setError(errorMessage);
      messageApi.error(errorMessage);
    }
    setLoading(false);
  };

  const deleteTask = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await taskApi.deleteTask(id);
      if (result.message) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
        messageApi.success(result.message || "Task deleted successfully!");
      } else {
        const errorMessage =
          typeof result.message === "string"
            ? result.message
            : "Failed to delete task";
        setError(errorMessage);
        messageApi.error(errorMessage);
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to delete task";
      setError(errorMessage);
      messageApi.error(errorMessage);
    }
    setLoading(false);
  };

  const toggleComplete = async (id: string) => {
    const taskToToggle = tasks.find((task) => task.id === id);
    if (!taskToToggle) return;

    const optimisticallyUpdatedTask = {
      ...taskToToggle,
      completed: !taskToToggle.completed,
    };

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? optimisticallyUpdatedTask : task
      )
    );

    try {
      await taskApi.updateTask(id, {
        completed: optimisticallyUpdatedTask.completed,
      } as any);
      messageApi.success(
        optimisticallyUpdatedTask.completed
          ? "Task marked as complete!"
          : "Task marked as incomplete!"
      );
    } catch (e: unknown) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? taskToToggle : task))
      );
      const errorMessage =
        e instanceof Error ? e.message : "Failed to toggle task completion";
      setError(errorMessage);
      messageApi.error(errorMessage);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
      }}
    >
      {contextHolder}
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
