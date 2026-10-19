import express from 'express';
import userController from '../controllers/userController.js';
import User from '../models/User.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', validateLogin, userController.login);
router.post('/register', validateRegister, userController.register);
router.post('/recharge', authenticateToken, userController.recharge);

// 更新个人资料（昵称、邮箱）
router.put('/profile', authenticateToken, userController.updateProfile);
// 修改密码
router.put('/password', authenticateToken, userController.changePassword);


// 获取当前登录用户信息（从数据库读取实时数据，避免 JWT 过期导致积分/余额/角色不一致）
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    const userInfo = {
      id: user.id,
      username: user.username,
      nickname: user.nickname || null,
      phone: user.phone,
      email: user.email || null,
      role: user.role || 'user',
      points: Number(user.points) || 0,
      balance: Number(user.balance) || 0
    };
    res.json({ success: true, data: userInfo });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ success: false, message: '获取用户信息失败' });
  }
});

export default router;