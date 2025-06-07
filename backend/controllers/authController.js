import jwt from "jsonwebtoken";
import Parent from "../models/Parent.js";
import Child from "../models/Child.js";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerParent = async (req, res) => {
  console.log("Registering parent with data:", req.body);
  try {
    const { name, email, password } = req.body;

    // Check if parent already exists
    const parentExists = await Parent.findOne({ email });
    if (parentExists) {
      console.log("Parent already exists with email:", email);
      return res.status(400).json({ error: "Parent already exists" });
    }

    // Create new parent
    const parent = await Parent.create({
      name,
      email,
      password,
    });
    console.log("Created new parent:", parent);

    // Generate token
    const token = generateToken(parent._id, "parent");

    res.status(201).json({
      _id: parent._id,
      name: parent.name,
      email: parent.email,
      role: "parent",
      token,
    });
  } catch (error) {
    console.error("Error registering parent:", error);
    res.status(400).json({ error: error.message });
  }
};

export const registerChild = async (req, res) => {
  console.log("Registering child with data:", req.body);
  try {
    const { name, email, password, parentId } = req.body;

    // Check if child already exists
    const childExists = await Child.findOne({ email });
    if (childExists) {
      console.log("Child already exists with email:", email);
      return res.status(400).json({ error: "Child already exists" });
    }

    // Check if parent exists
    const parent = await Parent.findById(parentId);
    if (!parent) {
      console.log("Parent not found with ID:", parentId);
      return res.status(400).json({ error: "Parent not found" });
    }

    // Create new child
    const child = await Child.create({
      name,
      email,
      password,
      parent: parentId,
    });
    console.log("Created new child:", child);

    // Add child to parent's children array
    parent.children.push(child._id);
    await parent.save();
    console.log("Added child to parent:", parent);

    // Generate token
    const token = generateToken(child._id, "child");

    res.status(201).json({
      _id: child._id,
      name: child.name,
      email: child.email,
      parent: child.parent,
      role: "child",
      token,
    });
  } catch (error) {
    console.error("Error registering child:", error);
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  console.log("Login attempt with data:", req.body);
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
      console.log("User not found with email:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id, isParent ? "parent" : "child");
    console.log("Login successful for user:", email);

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
