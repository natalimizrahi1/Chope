import express from "express";
import Child from "../models/Child.js";
import { protect as auth } from "../middleware/auth.js";

const router = express.Router();

// Get pet state
router.get("/state", auth, async (req, res) => {
  try {
    const child = await Child.findById(req.user.id);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    res.json({ petState: child.getPetState() });
  } catch (error) {
    console.error("Error getting pet state:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update pet state
router.put("/state", auth, async (req, res) => {
  try {
    const { petState } = req.body;
    const child = await Child.findById(req.user.id);

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    await child.updatePetState(petState);
    res.json({ message: "Pet state updated successfully", petState: child.getPetState() });
  } catch (error) {
    console.error("Error updating pet state:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update pet stats
router.put("/stats", auth, async (req, res) => {
  try {
    const { stats } = req.body;
    const child = await Child.findById(req.user.id);

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    child.petState.stats = {
      ...child.petState.stats,
      ...stats,
    };

    await child.save();
    res.json({ message: "Pet stats updated successfully", stats: child.petState.stats });
  } catch (error) {
    console.error("Error updating pet stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update pet accessories
router.put("/accessories", auth, async (req, res) => {
  try {
    const { accessories } = req.body;
    const child = await Child.findById(req.user.id);

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    child.petState.accessories = accessories;
    await child.save();

    res.json({ message: "Pet accessories updated successfully", accessories: child.petState.accessories });
  } catch (error) {
    console.error("Error updating pet accessories:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
