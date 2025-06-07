import express from 'express';
import { protect } from '../middleware/auth.js';
import Animal from '../models/Animal.js';
import Child from '../models/Child.js';

const router = express.Router();

// Create animal
router.post('/', protect, async (req, res) => {
  try {
    const { type, name, owner } = req.body;
    const animal = await Animal.create({
      type,
      name,
      owner
    });

    // Add animal to child
    const child = await Child.findById(owner);
    child.animal = animal._id;
    await child.save();

    res.status(201).json(animal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get child's animal
router.get('/child/:childId', protect, async (req, res) => {
  try {
    const animal = await Animal.findOne({ owner: req.params.childId });
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    res.json(animal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Feed animal
router.patch('/:animalId', protect, async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.animalId);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Update last fed time
    animal.lastFed = new Date();
    
    // Level up if enough time has passed
    const hoursSinceLastFed = (new Date() - animal.lastFed) / (1000 * 60 * 60);
    if (hoursSinceLastFed >= 24) {
      animal.level += 1;
    }

    await animal.save();
    res.json(animal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 