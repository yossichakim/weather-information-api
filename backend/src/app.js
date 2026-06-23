import express from "express";
import cors from "cors";

import { mountOpenApiDocumentation } from "./docs/openapi.js";
import weatherRoutes from "./routes/weather.routes.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGINS ?? "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // CORS is a browser-enforced policy, not authentication. Requests
      // without an Origin header remain available to API tools, automated
      // tests, and server-to-server clients.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error("Origin is not allowed by CORS");
      error.statusCode = 403;
      callback(error);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Weather Information API is running",
  });
});

mountOpenApiDocumentation(app);

app.use("/api/weather", weatherRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Controllers and services forward operational failures here so the API uses
// one JSON error envelope while preserving intentional status codes.
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.statusCode || 500).json({
    status: "error",
    message: error.message || "Internal server error",
  });
});

// Keep the route-not-found response separate from operational errors so an
// unknown path is represented as a client failure rather than a server fault.
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Route not found",
  });
});

export default app;
