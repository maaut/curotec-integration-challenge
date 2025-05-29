import express, { Express, Request, Response } from "express";
import { loggerMiddleware } from "./middlewares/logger";
import healthRouter from "./routes/health";

const app: Express = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(loggerMiddleware);
app.use(express.json());

// Routes
app.use("/api", healthRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
