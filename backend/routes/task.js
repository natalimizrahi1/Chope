import express from 'express';
import { protect } from '../middleware/auth.js';
import Task from '../models/Task.js';
import Child from '../models/Child.js';

const router = express.Router();

// Create task
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, reward, child } = req.body;
    const task = await Task.create({
      title,
      description,
      reward,
      child
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get child's tasks
router.get('/child/:childId', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ child: req.params.childId });
    res.json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Complete task
router.patch('/:taskId/complete', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = true;
    await task.save();

    // Add coins to child
    const child = await Child.findById(task.child);
    child.coins += task.reward;
    await child.save();

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 