import { useState, useCallback } from "react";
import { message } from "antd";
import { taskApi } from "../services/taskApi";
import type {
  Task,
  GetAllTasksParams,
  // PaginatedTasksResponse, // Not directly returned, but its structure is used in fetchTasks
} from "../types/task.types";

// Define state for pagination, sorting, and filters for the hook
export interface TasksManagerState extends GetAllTasksParams {
  totalTasks: number;
  totalPages: number;
}

export const useTaskManager = () => {
  const [messageApi, contextHolder] = message.useMessage(); // For user feedback
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

  const fetchTasks = useCallback(
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
        const response = await taskApi.getAllTasks(apiParams);
        setTasks(response.tasks);
        setTasksStateInternal((prev) => ({
          ...prev,
          ...newState, // Apply incoming new state for parameters like page/limit if they changed
          totalTasks: response.total,
          totalPages: response.totalPages,
          page: response.page, // Ensure current page from response is set
          limit: response.limit, // Ensure current limit from response is set
        }));
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : "Failed to fetch tasks";
        setError(errorMessage);
        messageApi.error(errorMessage); // Display error message
      }
      setLoading(false);
    },
    [tasksState, messageApi] // messageApi added as dependency
  );

  const addTask = async (
    taskData: Omit<Task, "id" | "completed" | "createdAt" | "updatedAt">
  ) => {
    setLoading(true);
    setError(null);
    try {
      await taskApi.addTask(taskData);
      messageApi.success("Task added successfully!");
      fetchTasks({ page: 1, search: "" }); // Refetch from first page, clear search potentially
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to add task";
      setError(errorMessage);
      messageApi.error(errorMessage);
      throw e; // Re-throw to allow components to handle if needed
    }
    setLoading(false);
  };

  const updateTask = async (updatedTaskData: Task) => {
    setLoading(true);
    setError(null);
    try {
      await taskApi.updateTask(updatedTaskData.id, updatedTaskData);
      messageApi.success("Task updated successfully!");
      fetchTasks(tasksState); // Refetch with current state
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to update task";
      setError(errorMessage);
      messageApi.error(errorMessage);
      throw e;
    }
    setLoading(false);
  };

  const deleteTask = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await taskApi.deleteTask(id);
      if (result.message) {
        messageApi.success(result.message || "Task deleted successfully!");
        if (tasks.length === 1 && tasksState.page && tasksState.page > 1) {
          fetchTasks({ ...tasksState, page: tasksState.page - 1 });
        } else {
          fetchTasks(tasksState);
        }
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to delete task";
      setError(errorMessage);
      messageApi.error(errorMessage);
      throw e;
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
      if (tasksState.completed !== "all") {
        fetchTasks(tasksState);
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
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    setTasksState,
  };
};
