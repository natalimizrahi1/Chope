import express from 'express';
import Animal from '../models/Animal.js';
import Child from '../models/Child.js';
import jwt from 'jsonwebtoken';

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

// Get child's animal
router.get('/child/:childId', auth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) return res.status(404).json({ error: 'Child not found' });
    const animal = await Animal.findById(child.animal);
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    res.json(animal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update animal (feed, play, etc.)
router.patch('/:animalId', auth, async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.animalId);
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    
    const { action } = req.body;
    switch (action) {
      case 'feed':
        animal.hunger = Math.max(0, animal.hunger - 20);
        break;
      case 'play':
        animal.happiness = Math.min(100, animal.happiness + 20);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    await animal.save();
    res.json(animal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router; 