import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { pingRedis, executeRedisCommand } from '../controllers/redisController.js';

const router = express.Router();

// Redis 管理接口仅管理员可用
router.use(authenticateToken, requireAdmin);

router.get('/ping', pingRedis);
router.post('/command', executeRedisCommand);

export default router;
