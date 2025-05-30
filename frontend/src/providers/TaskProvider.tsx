import React, { type ReactNode } from "react";
import { useTaskManager } from "../hooks/useTaskManager";
import { TaskContext } from "../contexts/taskContext";

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
