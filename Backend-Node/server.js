import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection } from "./config/database.js";
import Logger from "./utils/logger.js";
import validateEnv from "./utils/validateEnv.js";

// Import routes
import authRouter from "./routes/auth.js";
import healthRouter from "./routes/health.js";
import incidentsRouter from "./routes/incidents.js";
import catchersRouter from "./routes/catchers.js";
import dashboardRouter from "./routes/dashboard.js";
import schedulesRouter from "./routes/schedules.js";
import strayAnimalsRouter from "./routes/strayAnimals.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  console.error("Environment validation failed:", error.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const logger = new Logger("SERVER");

// Middleware
// CORS - Allow web frontend and mobile app
const allowedOrigins = [
  "http://localhost:5173", // Web frontend
  "http://192.168.0.108:5173", // Web on network
  "exp://192.168.0.108:8081", // Expo mobile
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // For development, allow all origins
        // TODO: In production, remove this and use strict origin checking
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.get("/", (req, res) => {
  res.json({
    message: "CityVetCare API",
    version: "3.0.0",
    platform: "Node.js/Express",
    description: "Complete report management system for City Vet Care",
    endpoints: {
      "/api/health": "Health check",
      "/api/auth": "Authentication (login, create account)",
      "/api/incidents": "Incident report management",
      "/api/catchers": "Catcher team management",
      "/api/dashboard": "Dashboard statistics",
      "/api/schedules": "Patrol scheduling",
      "/api/stray-animals": "Stray animals management",
    },
  });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/incidents", incidentsRouter);
app.use("/api/catchers", catchersRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/schedules", schedulesRouter);
app.use("/api/stray-animals", strayAnimalsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: "Endpoint not found",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error("Server error", err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start listening
    app.listen(PORT, () => {
      logger.info("=================================");
      logger.info("🚀 CityVetCare API Server");
      logger.info("=================================");
      logger.info(`📡 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}`);
      logger.info(`📚 Docs: http://localhost:${PORT}/`);
      logger.info("=================================");
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();

export default app;
