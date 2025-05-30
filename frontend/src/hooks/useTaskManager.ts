import { useState, useCallback, useRef } from "react";
import { message } from "antd";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  inviteUserToTask,
  uninviteUserFromTask,
} from "../services/taskApi";
import type { Task, GetAllTasksParams } from "../types/task.types";
import { useAuth } from "../hooks/useAuth";

export interface TasksManagerState {
  totalTasks: number;
  totalPages: number;
  currentPage: number;
  currentLimit: number;
}

export const useTaskManager = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [tasksState, setTasksStateInternal] = useState<TasksManagerState>({
    totalTasks: 0,
    totalPages: 0,
    currentPage: 1,
    currentLimit: 10,
  });

  const isFetchingRef = useRef(false);

  const setTasksState = (newState: Partial<TasksManagerState>) => {
    setTasksStateInternal((prevState) => ({ ...prevState, ...newState }));
  };

  const fetchTasksInternal = useCallback(
    async (params?: GetAllTasksParams) => {
      if (!user || isFetchingRef.current) return;

      isFetchingRef.current = true;
      setLoading(true);

      const apiParams: GetAllTasksParams = {
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...params,
      };

      if (!apiParams.search) delete apiParams.search;
      if (apiParams.completed === "all") delete apiParams.completed;

      try {
        const response = await fetchTasks(apiParams);
        setTasks(response.tasks);

        setTasksStateInternal({
          totalTasks: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          currentLimit: response.limit,
        });
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : "Failed to fetch tasks";
        messageApi.error(errorMessage);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [messageApi, user]
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
    if (loading) return;
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
    if (loading) return;
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
    if (loading) return;
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
      fetchTasksInternal();
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
    if (loading) return;
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
    if (loading) return;
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
