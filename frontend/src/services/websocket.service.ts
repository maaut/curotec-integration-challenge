import { io, Socket } from "socket.io-client";

export interface NotificationData {
  type: "TASK_INVITATION" | "TASK_UNINVITATION";
  data: {
    task: {
      id: string;
      title: string;
      description?: string;
    };
    inviter?: {
      id: string;
      email: string;
    };
    uninviter?: {
      id: string;
      email: string;
    };
    message: string;
    timestamp: string;
  };
}

export type NotificationCallback = (notification: NotificationData) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private callbacks: NotificationCallback[] = [];

  public connect(token: string): void {
    if (this.socket?.connected) {
      console.log("WebSocket already connected, skipping connection");
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const sanitizedUrl = serverUrl.replace("/api", "");

    this.socket = io(sanitizedUrl, {
      auth: {
        token,
      },
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
    });

    this.socket.on("notification", (notification: NotificationData) => {
      this.callbacks.forEach((callback) => {
        callback(notification);
      });
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public onNotification(callback: NotificationCallback): () => void {
    console.log(
      "📝 Registering notification callback. Total callbacks:",
      this.callbacks.length + 1
    );
    this.callbacks.push(callback);

    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
        console.log(
          "🗑️ Unregistered notification callback. Remaining callbacks:",
          this.callbacks.length
        );
      }
    };
  }

  public isConnectedToServer(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
