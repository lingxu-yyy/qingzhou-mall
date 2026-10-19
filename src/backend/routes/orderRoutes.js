import express from 'express';
import orderController from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 订单接口全部需要登录
router.use(authenticateToken);

router.post('/', orderController.createOrder);

router.get('/', orderController.getMyOrders);

router.get('/:id', orderController.getOrderById);

router.put('/:id/pay', orderController.payOrder);

router.put('/:id/complete', orderController.completeOrder);

router.put('/:id/cancel', orderController.cancelOrder);

export default router;
