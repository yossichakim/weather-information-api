import express from "express";

import weatherRoutes from "./routes/weather.routes.js";

import authRoutes from "./routes/auth.routes.js";

import taskRoutes from "./routes/task.routes.js";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Weather Information API is running",
  });
});

app.use("/api/weather", weatherRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);

app.use((error, req, res, next) => {
    console.error(error);
  
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
});

app.use((req, res) => {
    res.status(404).json({
      status: "fail",
      message: "Route not found",
    });
});

export default app;