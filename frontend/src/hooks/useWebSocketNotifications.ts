import { useEffect, useCallback } from "react";
import { message } from "antd";
import { webSocketService } from "../services/websocket.service";
import type { NotificationData } from "../services/websocket.service";
import { useAuth } from "../hooks/useAuth";

export const useWebSocketNotifications = (fetchTasks?: () => Promise<void>) => {
  const { token } = useAuth();

  const handleNotification = useCallback(
    (notification: NotificationData) => {
      const { type, data } = notification;

      switch (type) {
        case "TASK_INVITATION":
          message.success({
            content: data.message,
            duration: 5,
            style: {
              marginTop: 20,
            },
          });
          if (fetchTasks) {
            fetchTasks();
          }
          break;

        case "TASK_UNINVITATION":
          message.info({
            content: data.message,
            duration: 5,
            style: {
              marginTop: 20,
            },
          });
          if (fetchTasks) {
            fetchTasks();
          }
          break;

        default:
          console.log("Unknown notification type:", type);
      }
    },
    [fetchTasks]
  );

  useEffect(() => {
    if (token) {
      webSocketService.connect(token);

      const unsubscribe = webSocketService.onNotification(handleNotification);

      return () => {
        unsubscribe();
      };
    }
  }, [token, handleNotification]);

  useEffect(() => {
    return () => {
      if (!token) {
        webSocketService.disconnect();
      }
    };
  }, [token]);

  return {
    isConnected: webSocketService.isConnectedToServer(),
  };
};
