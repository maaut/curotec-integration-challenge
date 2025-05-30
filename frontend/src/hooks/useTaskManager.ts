import { useState, useCallback } from "react";
import { message } from "antd";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  inviteUserToTask,
  uninviteUserFromTask,
} from "../services/taskApi";
import type { Task, GetAllTasksParams } from "../types/task.types";
import { useAuth } from "../providers/AuthContext";

export interface TasksManagerState extends GetAllTasksParams {
  totalTasks: number;
  totalPages: number;
}

export const useTaskManager = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
      if (!user) return;
      setLoading(true);
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
        messageApi.error(errorMessage);
      }
      setLoading(false);
    },
    [tasksState, messageApi, user]
  );

  const addTaskInternal = async (
    taskData: Omit<
      Task,
      "id" | "completed" | "createdAt" | "updatedAt" | "userId" | "invitee"
    > & {
      description?: string;
      inviteeEmail?: string;
    }
  ) => {
    setLoading(true);
    try {
      await createTask(taskData);
      messageApi.success("Task added successfully!");
      fetchTasksInternal();
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to add task";
      messageApi.error(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskInternal = async (
    taskId: string,
    taskData: Partial<
      Omit<
        Task,
        "id" | "createdAt" | "updatedAt" | "userId" | "invitee" | "inviteeEmail"
      >
    >
  ) => {
    setLoading(true);
    try {
      await updateTask(taskId, taskData);
      messageApi.success("Task updated successfully!");
      fetchTasksInternal();
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to update task";
      messageApi.error(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteTaskInternal = async (id: string) => {
    setLoading(true);
    try {
      await deleteTask(id);
      messageApi.success("Task deleted successfully!");
      fetchTasksInternal();
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to delete task";
      messageApi.error(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const toggleCompleteInternal = async (id: string) => {
    const taskToToggle = tasks.find((task) => task.id === id);

    if (!taskToToggle) {
      messageApi.error("Task not found for toggling.");
      return;
    }

    if (taskToToggle.userId !== user?.id) {
      messageApi.error("You are not the owner of this task.");
      return;
    }

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
      if (tasksState.completed !== "all") {
        fetchTasksInternal();
      } else {
        const updatedTaskFromApi = await toggleTaskCompletion(
          id,
          optimisticallyUpdatedTask.completed
        );
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? updatedTaskFromApi : task))
        );
      }
    } catch (e: unknown) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? taskToToggle : task))
      );
      const errorMessage =
        e instanceof Error ? e.message : "Failed to toggle task completion";
      messageApi.error(errorMessage);
      throw e;
    }
  };

  const inviteToTaskInternal = async (taskId: string, inviteeEmail: string) => {
    setLoading(true);
    try {
      const updatedTask = await inviteUserToTask(taskId, inviteeEmail);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      messageApi.success(`User ${inviteeEmail} invited to task successfully!`);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to invite user to task";
      messageApi.error(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const uninviteFromTaskInternal = async (taskId: string) => {
    setLoading(true);
    try {
      const updatedTask = await uninviteUserFromTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      messageApi.success("User uninvited from task successfully!");
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to uninvite user from task";
      messageApi.error(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    tasksState,
    contextHolder,
    fetchTasks: fetchTasksInternal,
    addTask: addTaskInternal,
    updateTask: updateTaskInternal,
    deleteTask: deleteTaskInternal,
    toggleComplete: toggleCompleteInternal,
    setTasksState,
    inviteToTask: inviteToTaskInternal,
    uninviteFromTask: uninviteFromTaskInternal,
  };
};
