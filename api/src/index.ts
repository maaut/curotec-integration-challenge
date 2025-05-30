import express, { Express } from "express";
import { createServer } from "http";
import cors from "cors";
import { loggerMiddleware } from "./middlewares/logger";
import healthRouter from "./routes/health";
import tasksRouter from "./routes/tasks";
import authRouter from "./routes/auth";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swaggerConfig";
import WebSocketService from "./services/websocket.service";

const app: Express = express();
const httpServer = createServer(app);
const port: string | number = process.env.PORT || 3000;

// Initialize WebSocket service
const webSocketService = new WebSocketService(httpServer);

// Make WebSocket service available globally
declare global {
  var webSocketService: WebSocketService;
}
global.webSocketService = webSocketService;

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(loggerMiddleware);
app.use(express.json());

// Swagger UI Setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api", healthRouter);
app.use("/api", tasksRouter);
app.use("/api/auth", authRouter);

httpServer.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  console.log(`[server]: WebSocket server is ready for connections`);
  console.log(
    `[server]: API Docs available at http://localhost:${port}/api-docs`
  );
});
