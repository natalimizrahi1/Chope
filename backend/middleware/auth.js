import jwt from "jsonwebtoken";
import Parent from "../models/Parent.js";
import Child from "../models/Child.js";

export const protect = async (req, res, next) => {
  let token;

  console.log("Auth middleware: Request path:", req.path);
  console.log("Auth middleware: Authorization header:", req.headers.authorization ? "exists" : "missing");
  console.log("Auth middleware: JWT_SECRET exists:", !!process.env.JWT_SECRET);

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      console.log("Auth middleware: Token extracted, length:", token?.length);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Auth middleware: Token verified, user ID:", decoded.id);

      // Get user from the token
      let user = await Parent.findById(decoded.id);
      let isParent = true;

      if (!user) {
        console.log("Auth middleware: User not found as parent, trying child");
        user = await Child.findById(decoded.id);
        isParent = false;
      }

      if (!user) {
        console.log("Auth middleware: User not found in database");
        return res.status(401).json({ error: "Not authorized" });
      }

      console.log("Auth middleware: User found:", {
        id: user._id,
        name: user.name,
        role: isParent ? "parent" : "child",
      });

      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: isParent ? "parent" : "child",
      };

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      console.error("Auth middleware error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      res.status(401).json({ error: "Not authorized" });
    }
  }

  if (!token) {
    console.log("Auth middleware: No token provided");
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
