import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  getCustomerOrders,
  getRevenueWeek,
  getRevenueMonth,
  getRevenue7Days,
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/deliver', updateOrderToDelivered);

router.get('/revenue/week', getRevenueWeek); // Route doanh thu tuần
router.get('/revenue/month', getRevenueMonth); // Route doanh thu tháng
router.get('/customer/:customerId', getCustomerOrders); // Route đơn hàng khách hàng
router.get('/revenue/7days', getRevenue7Days); // Route doanh thu 7 ngày qua

export default router; 