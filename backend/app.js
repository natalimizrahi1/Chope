import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/task.js";
import animalRoutes from "./routes/animal.js";
import parentRoutes from "./routes/parent.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Debug middleware - commented out to reduce console output
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.path}`, req.body);
//   next();
// });

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chope";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Chope backend running");
});

// Test endpoint to check JWT functionality
app.get("/test", (req, res) => {
  res.json({
    message: "Server is running",
    jwtSecret: process.env.JWT_SECRET ? "JWT_SECRET is set" : "JWT_SECRET is missing",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/parent", parentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
