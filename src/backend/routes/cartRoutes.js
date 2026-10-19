import express from 'express';
import cartController from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 购物车全部需要登录
router.use(authenticateToken);

router.get('/', cartController.list);
router.post('/', cartController.add);
router.put('/:id', cartController.update);
router.delete('/', cartController.clear);
router.delete('/:id', cartController.remove);

export default router;
