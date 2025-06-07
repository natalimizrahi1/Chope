import jwt from "jsonwebtoken";
import Parent from "../models/Parent.js";
import Child from "../models/Child.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      let user = await Parent.findById(decoded.id);
      let isParent = true;

      if (!user) {
        user = await Child.findById(decoded.id);
        isParent = false;
      }

      if (!user) {
        return res.status(401).json({ error: "Not authorized" });
      }

      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: isParent ? "parent" : "child",
      };

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401).json({ error: "Not authorized" });
    }
  }

  if (!token) {
    res.status(401).json({ error: "Not authorized, no token" });
  }
};

export const parentAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const parent = await Parent.findOne({ _id: decoded.id });

    if (!parent) {
      throw new Error();
    }

    req.user = parent;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate as a parent." });
  }
};

export const childAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.role || decoded.role !== "child") {
      return res.status(401).json({ error: "Please login as a child." });
    }
    const child = await Child.findOne({ _id: decoded.id });
    if (!child) {
      throw new Error();
    }
    req.user = child;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate as a child." });
  }
};
