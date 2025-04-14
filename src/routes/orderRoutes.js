import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/',  getOrders);
router.get('/myorders', getMyOrders);
router.get('/:id',  getOrderById);
router.put('/:id/pay',  updateOrderToPaid);
router.put('/:id/deliver', updateOrderToDelivered);

export default router; 