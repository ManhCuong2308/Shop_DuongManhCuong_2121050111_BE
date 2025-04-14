import express from 'express';
import {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserOrders,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Admin routes
router.get('/', getUsers);
router.get('/:userId/orders', getUserOrders);

export default router; 