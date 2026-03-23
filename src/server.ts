// server.ts
import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db";
import "./models/associations"; // Import associations to set up relations

import authRoutes from "./routes/auth_routes";
// import userRoutes from "./routes/user_routes";
// import consultationRoutes from "./routes/consultation_routes";
// ... other routes

dotenv.config();

// Validate required environment variables
const requiredEnv = ["DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST", "SECRET_KEY"];
const missing = requiredEnv.filter(key => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const app = express();
app.use(express.json());

// Mount routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// ... other route mounts

const PORT = process.env.PORT || 8000;

// Sync database (use migrations in production, sync only in development)
const startServer = async () => {
  try {
    await sequelize.authenticate(); // check connection first
    console.log("Database connection established.");
    // Sync – alter: false ensures no accidental schema changes
    await sequelize.sync({ alter: false });
    console.log("Database synced");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("Shutting down gracefully...");
      server.close(async () => {
        await sequelize.close();
        console.log("Database connection closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    // Handle uncaught exceptions and rejections
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      shutdown();
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      shutdown();
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();