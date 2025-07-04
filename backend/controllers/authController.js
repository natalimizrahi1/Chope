import jwt from "jsonwebtoken";
import Parent from "../models/Parent.js";
import Child from "../models/Child.js";
import dotenv from "dotenv";

dotenv.config();

const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerParent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if parent already exists
    const parentExists = await Parent.findOne({ email });
    if (parentExists) {
      return res.status(400).json({ error: "Parent already exists" });
    }

    // Create new parent
    const parent = await Parent.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(parent._id);

    res.status(201).json({
      _id: parent._id,
      name: parent.name,
      email: parent.email,
      token,
    });
  } catch (error) {
    console.error("Error registering parent:", error);
    res.status(400).json({ error: error.message });
  }
};

export const registerChild = async (req, res) => {
  try {
    const { name, email, password, parentId } = req.body;

    // Check if child already exists
    const childExists = await Child.findOne({ email });
    if (childExists) {
      return res.status(400).json({ error: "Child already exists" });
    }

    // Check if parent exists
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(400).json({ error: "Parent not found" });
    }

    // Create new child
    const child = await Child.create({
      name,
      email,
      password,
      parent: parentId,
    });

    // Add child to parent's children array
    parent.children.push(child._id);
    await parent.save();

    // Generate token
    const token = generateToken(child._id);

    res.status(201).json({
      _id: child._id,
      name: child.name,
      email: child.email,
      parent: child.parent,
      token,
    });
  } catch (error) {
    console.error("Error registering child:", error);
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find user as parent
    let user = await Parent.findOne({ email });
    let isParent = true;

    // If not found as parent, try as child
    if (!user) {
      user = await Child.findOne({ email });
      isParent = false;
    }

    // If user not found
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: isParent ? "parent" : "child",
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(400).json({ error: error.message });
  }
};
