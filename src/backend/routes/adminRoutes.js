import express from 'express';
import adminController from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken, requireAdmin);
router.get('/overview', adminController.getOverview);
router.get('/users', adminController.getUsers);
router.get('/orders', adminController.getOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

export default router;
