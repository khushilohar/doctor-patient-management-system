// server.ts
import http from "http";
import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db";
import "./models/associations"; // Import associations to set up relations

import authRoutes from "./routes/auth_routes";
// import userRoutes from "./routes/user_routes";
// import consultationRoutes from "./routes/consultation_routes";
// ... other routes

dotenv.config();

const app = express();
app.use(express.json());

// Mount routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// ... other route mounts

const PORT = process.env.PORT || 8000;

// Sync database (force: false for development; use migrations in production)
sequelize.sync({ alter: false }).then(() => {
  console.log("Database synced");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Database sync failed:", err);
});