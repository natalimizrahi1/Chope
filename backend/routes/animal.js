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
    
    // Update stats before sending
    animal.updateStats();
    await animal.save();
    
    res.json(animal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Feed animal
router.patch('/:animalId/feed', protect, async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.animalId);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Update last fed time and hunger
    animal.lastFed = new Date();
    animal.stats.hunger = Math.min(100, animal.stats.hunger + 30);
    animal.stats.happiness = Math.min(100, animal.stats.happiness + 10);
    
    // Add experience
    animal.experience += 10;
    
    // Check for level up
    if (animal.canLevelUp()) {
      animal.levelUp();
    }

    await animal.save();
    res.json(animal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Play with animal
router.patch('/:animalId/play', protect, async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.animalId);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Update last played time and happiness
    animal.lastPlayed = new Date();
    animal.stats.happiness = Math.min(100, animal.stats.happiness + 30);
    animal.stats.energy = Math.max(0, animal.stats.energy - 20);
    
    // Add experience
    animal.experience += 15;
    
    // Check for level up
    if (animal.canLevelUp()) {
      animal.levelUp();
    }

    await animal.save();
    res.json(animal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Let animal sleep
router.patch('/:animalId/sleep', protect, async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.animalId);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Update last slept time and energy
    animal.lastSlept = new Date();
    animal.stats.energy = Math.min(100, animal.stats.energy + 50);
    
    // Add experience
    animal.experience += 5;
    
    // Check for level up
    if (animal.canLevelUp()) {
      animal.levelUp();
    }

    await animal.save();
    res.json(animal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Buy accessory
router.post('/:animalId/accessories', protect, async (req, res) => {
  try {
    const { type, name, price } = req.body;
    const animal = await Animal.findById(req.params.animalId);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Get child to check coins
    const child = await Child.findById(animal.owner);
    if (child.coins < price) {
      return res.status(400).json({ error: 'Not enough coins' });
    }

    // Add accessory
    animal.accessories.push({
      type,
      name,
      price,
      equipped: false
    });

    // Deduct coins
    child.coins -= price;
    await child.save();

    // Add experience
    animal.experience += 20;
    if (animal.canLevelUp()) {
      animal.levelUp();
    }

    await animal.save();
    res.json(animal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Equip/unequip accessory
router.patch('/:animalId/accessories/:accessoryId', protect, async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.animalId);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    const accessory = animal.accessories.id(req.params.accessoryId);
    if (!accessory) {
      return res.status(404).json({ error: 'Accessory not found' });
    }

    // Toggle equipped status
    accessory.equipped = !accessory.equipped;
    await animal.save();
    res.json(animal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 