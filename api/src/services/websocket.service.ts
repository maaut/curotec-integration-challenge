import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

import { Socket } from "socket.io";

class WebSocketService {
  private io: SocketIOServer;
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || [
          "http://localhost:5173",
          "http://localhost:3000",
        ],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error("No token provided");
        }

        const jwtSecret = process.env.JWT_SECRET || "your_secret_key";

        const decoded = jwt.verify(token, jwtSecret) as {
          user: { id: string; email: string };
        };

        socket.userId = decoded.user.id;

        next();
      } catch (error) {
        console.error("❌ WebSocket authentication error:", error);
        next(new Error("Authentication failed"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      if (socket.userId) {
        const userSockets = this.userSockets.get(socket.userId) || [];
        userSockets.push(socket.id);
        this.userSockets.set(socket.userId, userSockets);

        socket.join(`user:${socket.userId}`);
      }

      socket.on("disconnect", () => {
        if (socket.userId) {
          const userSockets = this.userSockets.get(socket.userId) || [];
          const updatedSockets = userSockets.filter((id) => id !== socket.id);

          if (updatedSockets.length === 0) {
            this.userSockets.delete(socket.userId);
          } else {
            this.userSockets.set(socket.userId, updatedSockets);
          }
        }
      });
    });
  }

  public notifyTaskInvitation(inviteeId: string, task: any, inviter: any) {
    const notification = {
      type: "TASK_INVITATION",
      data: {
        task,
        inviter,
        message: `You have been invited to collaborate on task: "${task.title}"`,
        timestamp: new Date().toISOString(),
      },
    };

    this.io.to(`user:${inviteeId}`).emit("notification", notification);
  }

  public notifyTaskUninvitation(inviteeId: string, task: any, uninviter: any) {
    const notification = {
      type: "TASK_UNINVITATION",
      data: {
        task,
        uninviter,
        message: `You have been removed from task: "${task.title}"`,
        timestamp: new Date().toISOString(),
      },
    };

    this.io.to(`user:${inviteeId}`).emit("notification", notification);
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  public getConnectedUsersCount(): number {
    return this.userSockets.size;
  }
}

export default WebSocketService;
