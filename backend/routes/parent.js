import express from "express";
import Parent from "../models/Parent.js";
import Child from "../models/Child.js";
import jwt from "jsonwebtoken";
import Task from "../models/Task.js";

const router = express.Router();

// Simple JWT auth middleware
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Get parent's children
router.get("/children", auth, async (req, res) => {
  try {
    const parent = await Parent.findById(req.user.id).populate("children");
    if (!parent) return res.status(404).json({ error: "Parent not found" });
    res.json(parent.children);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get child's progress
router.get("/child/:childId/progress", auth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) return res.status(404).json({ error: "Child not found" });
    res.json({
      coins: child.coins,
      tasks: child.tasks,
      animal: child.animal,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tasks for all children of the parent
router.get("/tasks", auth, async (req, res) => {
  try {
    const children = await Child.find({ parent: req.user.id });
    const childIds = children.map(child => child._id);
    const tasks = await Task.find({ child: { $in: childIds } }).populate("child", "name");
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
