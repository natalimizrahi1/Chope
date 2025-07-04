import express from "express";
import { protect } from "../middleware/auth.js";
import Task from "../models/Task.js";
import Child from "../models/Child.js";

const router = express.Router();

// Create task
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, reward, child, category } = req.body;
    const task = await Task.create({
      title,
      description,
      reward,
      child,
      category: category || "custom",
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get child's tasks
router.get("/child/:childId", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ child: req.params.childId });
    res.json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Complete task (child marks as completed, waits for parent approval)
router.patch("/:taskId/complete", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.completed) {
      return res.status(400).json({ error: "Task is already completed" });
    }

    task.completed = true;
    task.completedAt = new Date();
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Approve task (parent approves completed task and gives coins)
router.patch("/:taskId/approve", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (!task.completed) {
      return res.status(400).json({ error: "Task must be completed before approval" });
    }

    if (task.approved) {
      return res.status(400).json({ error: "Task is already approved" });
    }

    task.approved = true;
    task.approvedAt = new Date();
    await task.save();

    // Add coins to child only after approval
    const child = await Child.findById(task.child);
    child.coins += task.reward;
    await child.save();

    res.json(task);
  } catch (error) {
    console.error("Error in approve task:", error);
    res.status(400).json({ error: error.message });
  }
});

// Reject task (parent rejects completed task)
router.patch("/:taskId/reject", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (!task.completed) {
      return res.status(400).json({ error: "Task must be completed before rejection" });
    }

    if (task.approved) {
      return res.status(400).json({ error: "Cannot reject an approved task" });
    }

    // If task was previously approved, subtract coins
    if (task.approved) {
      const child = await Child.findById(task.child);
      child.coins = Math.max(0, child.coins - task.reward); // Ensure coins don't go below 0
      await child.save();
    }

    // Reset task to not completed
    task.completed = false;
    task.completedAt = null;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Undo task completion (child can undo before parent approves)
router.patch("/:taskId/undo", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (!task.completed) {
      return res.status(400).json({ error: "Task is not completed" });
    }

    // If task was previously approved, subtract coins
    if (task.approved) {
      const child = await Child.findById(task.child);
      child.coins = Math.max(0, child.coins - task.reward); // Ensure coins don't go below 0
      await child.save();
    }

    task.completed = false;
    task.completedAt = null;
    task.approved = false;
    task.approvedAt = null;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Error in undo task:", error);
    res.status(400).json({ error: error.message });
  }
});

// Unapprove task (parent can unapprove an approved task)
router.patch("/:taskId/unapprove", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (!task.completed) {
      return res.status(400).json({ error: "Task must be completed before unapproval" });
    }

    if (!task.approved) {
      return res.status(400).json({ error: "Task is not approved" });
    }

    // Subtract coins from child
    const child = await Child.findById(task.child);
    child.coins = Math.max(0, child.coins - task.reward); // Ensure coins don't go below 0
    await child.save();

    // Reset task to not approved
    task.approved = false;
    task.approvedAt = null;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Error in unapprove task:", error);
    res.status(400).json({ error: error.message });
  }
});

// Delete task (parent can delete task if not completed)
router.delete("/:taskId", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Only allow deletion if task is not completed
    if (task.completed) {
      return res.status(400).json({ error: "Cannot delete a completed task" });
    }

    await Task.findByIdAndDelete(req.params.taskId);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error in delete task:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
