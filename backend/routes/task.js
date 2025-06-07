import express from 'express';
import Task from '../models/Task.js';
import jwt from 'jsonwebtoken';
import Parent from '../models/Parent.js';
import Child from '../models/Child.js';

const router = express.Router();

// Simple JWT auth middleware
function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Create a task (parent)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, reward, child } = req.body;
    const task = new Task({
      title,
      description,
      reward,
      child,
      parent: req.user.id,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List tasks for a child
router.get('/child/:childId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ child: req.params.childId });
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark task as completed (child)
router.patch('/:taskId/complete', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.completed) return res.status(400).json({ error: 'Task already completed' });
    task.completed = true;
    await task.save();
    // Award coins to child
    const child = await Child.findById(task.child);
    if (child) {
      child.coins += task.reward;
      await child.save();
    }
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router; 