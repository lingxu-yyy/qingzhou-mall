import express from 'express';
import favoriteController from '../controllers/favoriteController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 收藏全部需要登录
router.use(authenticateToken);

router.get('/', favoriteController.list);
router.get('/ids', favoriteController.ids);
router.post('/', favoriteController.add);
router.post('/toggle', favoriteController.toggle);
router.delete('/:productId', favoriteController.remove);

export default router;
