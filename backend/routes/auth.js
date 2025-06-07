import express from 'express';
import { registerParent, registerChild, login } from '../controllers/authController.js';

const router = express.Router();

// Register routes
router.post('/register/parent', registerParent);
router.post('/register/child', registerChild);

// Login route
router.post('/login', login);

export default router; 