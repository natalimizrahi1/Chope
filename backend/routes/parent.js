import express from "express";
import Parent from "../models/Parent.js";
import Child from "../models/Child.js";
import Task from "../models/Task.js";
import jwt from "jsonwebtoken";

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
    console.error("Error getting children:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get child's progress
router.get("/child/:childId/progress", auth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) return res.status(404).json({ error: "Child not found" });

    // Get child's tasks
    const tasks = await Task.find({ child: req.params.childId });

    res.json({
      coins: child.coins,
      tasks: tasks,
      animal: child.animal,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get specific child by ID
router.get("/child/:childId", auth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) return res.status(404).json({ error: "Child not found" });
    res.json(child);
  } catch (err) {
    console.error("Error getting child:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get child's coins
router.get("/child/:childId/coins", auth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) return res.status(404).json({ error: "Child not found" });
    res.json({ coins: child.coins });
  } catch (err) {
    console.error("Error getting child coins:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get child's purchased items
router.get("/child/:childId/items", auth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) return res.status(404).json({ error: "Child not found" });
    res.json({ purchasedItems: child.purchasedItems });
  } catch (err) {
    console.error("Error getting child items:", err);
    res.status(400).json({ error: err.message });
  }
});

// Update child's coins (for spending on pet care, items, etc.)
router.patch("/child/:childId/coins", auth, async (req, res) => {
  try {
    const { amount, action, description } = req.body;
    const child = await Child.findById(req.params.childId);

    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    // Check if child has enough coins for spending
    if (amount < 0 && Math.abs(amount) > child.coins) {
      return res.status(400).json({ error: "Not enough coins" });
    }

    // Update coins
    child.coins += amount;

    // Ensure coins don't go below 0
    if (child.coins < 0) {
      child.coins = 0;
    }

    await child.save();

    res.json({
      coins: child.coins,
      action,
      description,
      message: amount > 0 ? "Coins added successfully" : "Coins spent successfully",
    });
  } catch (err) {
    console.error("Error updating child coins:", err);
    res.status(400).json({ error: err.message });
  }
});

// Spend coins on pet care (feeding, playing, sleeping)
router.post("/child/:childId/pet-care", auth, async (req, res) => {
  try {
    const { action, cost } = req.body;
    const child = await Child.findById(req.params.childId);

    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    if (child.coins < cost) {
      return res.status(400).json({ error: "Not enough coins for this action" });
    }

    // Deduct coins
    child.coins -= cost;
    await child.save();

    res.json({
      coins: child.coins,
      action,
      cost,
      message: `${action} completed successfully`,
    });
  } catch (err) {
    console.error("Error performing pet care:", err);
    res.status(400).json({ error: err.message });
  }
});

// Buy items from shop
router.post("/child/:childId/buy-items", auth, async (req, res) => {
  try {
    const { items, totalCost } = req.body;
    const child = await Child.findById(req.params.childId);

    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    if (child.coins < totalCost) {
      return res.status(400).json({ error: "Not enough coins to buy these items" });
    }

    // Deduct coins
    child.coins -= totalCost;

    // Add items to purchasedItems array using the model method
    // Use the model method to add items
    child.addItems(items);

    await child.save();

    res.json({
      coins: child.coins,
      purchasedItems: child.purchasedItems,
      totalCost,
      message: "Items purchased successfully",
    });
  } catch (err) {
    console.error("Error buying items:", err);
    res.status(400).json({ error: err.message });
  }
});

// Use an item
router.post("/child/:childId/use-item", auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    const child = await Child.findById(req.params.childId);

    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    const result = child.useItem(itemId);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    // For accessories, keep the item in inventory with quantity=0 so it can be returned later
    if (result.itemType === "accessory") {
      const existingItem = child.purchasedItems.find(i => i.id === itemId);
      if (!existingItem) {
        // Add the item back with quantity=0
        const newItem = {
          id: itemId,
          name: result.itemName || "Accessory",
          image: result.itemImage || "",
          type: "accessory",
          price: result.itemPrice || 0,
          quantity: 0,
        };
        child.purchasedItems.push(newItem);
      } else {
        // Ensure the item stays in inventory with quantity=0
        existingItem.quantity = 0;
      }
    }

    await child.save();

    res.json({
      success: true,
      message: result.message,
      purchasedItems: child.purchasedItems,
      animal: child.animal,
    });
  } catch (err) {
    console.error("Error using item:", err);
    res.status(400).json({ error: err.message });
  }
});

// Remove an item
router.delete("/child/:childId/remove-item", auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    const child = await Child.findById(req.params.childId);

    if (!child) {
      return res.status(404).json({ error: "Child not found" });
    }

    const result = child.removeItem(itemId);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    await child.save();

    res.json({
      success: true,
      message: result.message,
      purchasedItems: child.purchasedItems,
    });
  } catch (err) {
    console.error("Error removing item:", err);
    res.status(400).json({ error: err.message });
  }
});

// Return item to inventory (increase quantity)
router.post("/child/:childId/return-item/:itemId", auth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) return res.status(404).json({ error: "Child not found" });

    const item = child.purchasedItems.find(i => i.id === req.params.itemId);
    if (item) {
      item.quantity += 1;
    } else {
      // If item not found, add it with quantity 1
      const newItem = {
        id: req.params.itemId,
        name: "Accessory", // Default name
        image: "", // Default image
        type: "accessory",
        price: 0,
        quantity: 1,
      };
      child.purchasedItems.push(newItem);
    }
    await child.save();
    res.json({ purchasedItems: child.purchasedItems, message: "Item returned to inventory" });
  } catch (err) {
    console.error("Error returning item to inventory:", err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
