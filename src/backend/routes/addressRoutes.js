import express from 'express';
import addressController from '../controllers/addressController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 收货地址全部需要登录，且只能操作本人地址
router.use(authenticateToken);

router.get('/', addressController.list);
router.post('/', addressController.create);
router.put('/:id', addressController.update);
router.put('/:id/default', addressController.setDefault);
router.delete('/:id', addressController.remove);

export default router;
