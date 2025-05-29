import { useState, useCallback } from "react";
import { message } from "antd";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
} from "../services/taskApi";
import type { Task, GetAllTasksParams } from "../types/task.types";

export interface TasksManagerState extends GetAllTasksParams {
  totalTasks: number;
  totalPages: number;
}

export const useTaskManager = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [tasksState, setTasksStateInternal] = useState<TasksManagerState>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    completed: "all",
    search: "",
    totalTasks: 0,
    totalPages: 0,
  });

  const setTasksState = (newState: Partial<TasksManagerState>) => {
    setTasksStateInternal((prevState) => ({ ...prevState, ...newState }));
  };

  const fetchTasksInternal = useCallback(
    async (newState?: Partial<TasksManagerState>) => {
      setLoading(true);
      setError(null);
      const currentState = { ...tasksState, ...newState };

      const apiParams: GetAllTasksParams = {
        page: currentState.page,
        limit: currentState.limit,
        sortBy: currentState.sortBy,
        sortOrder: currentState.sortOrder,
        completed: currentState.completed,
        search: currentState.search,
      };

      if (!apiParams.search) delete apiParams.search;
      if (apiParams.completed === "all") delete apiParams.completed;

      try {
        const response = await fetchTasks(apiParams);
        setTasks(response.tasks);
        setTasksStateInternal((prev) => ({
          ...prev,
          ...newState,
          totalTasks: response.total,
          totalPages: response.totalPages,
          page: response.page,
          limit: response.limit,
        }));
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : "Failed to fetch tasks";
        setError(errorMessage);
        messageApi.error(errorMessage);
      }
      setLoading(false);
    },
    [tasksState, messageApi]
  );

  const addTaskInternal = async (
    taskData: Omit<Task, "id" | "completed" | "createdAt" | "updatedAt"> & {
      description?: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      await createTask(taskData);
      messageApi.success("Task added successfully!");
      fetchTasksInternal();
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to add task";
      setError(errorMessage);
      messageApi.error(errorMessage);
      throw e;
    }
    setLoading(false);
  };

  const updateTaskInternal = async (updatedTaskData: Task) => {
    setLoading(true);
    setError(null);
    try {
      await updateTask(updatedTaskData.id, updatedTaskData);
      messageApi.success("Task updated successfully!");
      fetchTasksInternal();
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to update task";
      setError(errorMessage);
      messageApi.error(errorMessage);
      throw e;
    }
    setLoading(false);
  };

  const deleteTaskInternal = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTask(id);
      messageApi.success("Task deleted successfully!");
      fetchTasksInternal();
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to delete task";
      setError(errorMessage);
      messageApi.error(errorMessage);
      throw e;
    }
    setLoading(false);
  };

  const toggleCompleteInternal = async (id: string) => {
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
      await toggleTaskCompletion(id, optimisticallyUpdatedTask.completed);
      messageApi.success(
        optimisticallyUpdatedTask.completed
          ? "Task marked as complete!"
          : "Task marked as incomplete!"
      );
      if (tasksState.completed !== "all") {
        fetchTasksInternal();
      }
    } catch (e: unknown) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? taskToToggle : task))
      );
      const errorMessage =
        e instanceof Error ? e.message : "Failed to toggle task completion";
      setError(errorMessage);
      messageApi.error(errorMessage);
      throw e;
    }
  };

  return {
    tasks,
    loading,
    error,
    tasksState,
    contextHolder,
    fetchTasks: fetchTasksInternal,
    addTask: addTaskInternal,
    updateTask: updateTaskInternal,
    deleteTask: deleteTaskInternal,
    toggleComplete: toggleCompleteInternal,
    setTasksState,
  };
};
