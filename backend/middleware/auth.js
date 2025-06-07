import jwt from 'jsonwebtoken';
import Parent from '../models/Parent.js';
import Child from '../models/Child.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const parent = await Parent.findOne({ _id: decoded.id });
    const child = await Child.findOne({ _id: decoded.id });

    if (!parent && !child) {
      throw new Error();
    }

    req.user = parent || child;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export const parentAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
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
    res.status(401).json({ error: 'Please authenticate as a parent.' });
  }
};

export const childAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
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
    res.status(401).json({ error: 'Please authenticate as a child.' });
  }
}; 