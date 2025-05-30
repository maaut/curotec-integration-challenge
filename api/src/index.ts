import express, { Express, Request, Response } from "express";
import cors from "cors";
import { loggerMiddleware } from "./middlewares/logger";
import healthRouter from "./routes/health";
import tasksRouter from "./routes/tasks";
import authRouter from "./routes/auth";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swaggerConfig";

const app: Express = express();
const port: string | number = process.env.PORT || 3000;

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

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  console.log(
    `[server]: API Docs available at http://localhost:${port}/api-docs`
  );
});
