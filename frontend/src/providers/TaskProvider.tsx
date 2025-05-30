import React, { type ReactNode } from "react";
import { useTaskManager } from "../hooks/useTaskManager";
import { TaskContext } from "../contexts/taskContext";
import { useWebSocketNotifications } from "../hooks/useWebSocketNotifications";

export const TaskProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const taskManager = useTaskManager();

  useWebSocketNotifications(taskManager.fetchTasks);

  return (
    <TaskContext.Provider value={taskManager}>
      {taskManager.contextHolder}
      {children}
    </TaskContext.Provider>
  );
};
