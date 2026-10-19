import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await User.findByUsername(username);
    if (!user) {
      user = await User.findByPhone(username);
    }

    if (!user) {
      logger.warn(`登录失败 - 用户不存在: ${username}`);
      return res.status(401).json({ success: false, message: '用户名/手机号或密码错误' });
    }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`登录失败 - 密码错误: ${username}`);
      return res.status(401).json({ success: false, message: '用户名/手机号或密码错误' });
    }

    // JWT 中携带 role，供 requireAdmin 中间件校验
    const token = generateToken(
      { userId: user.id, username: user.username, role: user.role || 'user' },
      '1h'
    );

    const userInfo = {
      id: user.id,
      username: user.username,
      phone: user.phone,
      role: user.role || 'user',
      points: Number(user.points) || 0,
      balance: Number(user.balance) || 0
    };

    logger.info(`用户登录成功: ${user.username}`);
    res.json({ success: true, data: userInfo, token });
  } catch (error) {
    logger.error(`登录失败: ${error.message}`);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

const register = async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    if (!username || username.length < 3) {
      return res.status(400).json({ success: false, message: '用户名至少需要3个字符' });
    }

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: '请输入正确的手机号码' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: '密码至少需要8个字符' });
    }

    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ success: false, message: '密码必须包含字母和数字' });
    }

    const existingByUsername = await User.findByUsername(username);
    if (existingByUsername) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }

    // 手机号唯一约束已加在数据库，提前查重可给出更友好的错误提示
    const existingByPhone = await User.findByPhone(phone);
    if (existingByPhone) {
      return res.status(400).json({ success: false, message: '该手机号已注册' });
    }

    const userId = await User.create({ username, password, phone });

    logger.info(`用户注册成功: ${username}, ID: ${userId}`);
    res.json({ success: true, message: '注册成功', userId });
  } catch (error) {
    logger.error(`注册失败: ${error.message}`);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 账户充值（模拟在线充值），充值金额写入 users.balance
const recharge = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: '充值金额不合法' });
    }
    if (amount > 50000) {
      return res.status(400).json({ success: false, message: '单次充值金额不能超过50000元' });
    }
    const balance = await User.addBalance(req.user.userId, amount);
    logger.info(`账户充值成功: 用户ID:${req.user.userId}, 充值${amount}元, 余额${balance}元`);
    res.json({ success: true, message: '充值成功', data: { balance } });
  } catch (error) {
    logger.error(`充值失败: ${error.message}`);
    res.status(500).json({ success: false, message: '充值失败' });
  }
};

// 更新个人资料（昵称、邮箱）
const updateProfile = async (req, res) => {
  try {
    const { nickname, email } = req.body;

    if (nickname !== undefined && nickname !== null && String(nickname).trim() !== '' && String(nickname).length > 50) {
      return res.status(400).json({ success: false, message: '昵称长度不能超过50个字符' });
    }
    if (email !== undefined && email !== null && String(email).trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: '邮箱格式不正确' });
    }

    const updated = await User.updateProfile(req.user.userId, {
      nickname: nickname ? String(nickname).trim() : null,
      email: email ? String(email).trim() : null
    });

    logger.info(`用户更新资料: 用户ID:${req.user.userId}`);
    res.json({
      success: true,
      message: '资料保存成功',
      data: {
        id: updated.id,
        username: updated.username,
        nickname: updated.nickname,
        phone: updated.phone,
        email: updated.email
      }
    });
  } catch (error) {
    logger.error(`更新资料失败: ${error.message}`);
    res.status(500).json({ success: false, message: '资料保存失败' });
  }
};

// 修改密码：校验当前密码与新密码强度
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '请填写当前密码和新密码' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: '新密码至少需要8个字符' });
    }
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({ success: false, message: '新密码必须包含字母和数字' });
    }

    await User.changePassword(req.user.userId, oldPassword, newPassword);
    logger.info(`用户修改密码成功: 用户ID:${req.user.userId}`);
    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    if (error.code === 'INVALID_OLD_PASSWORD') {
      return res.status(400).json({ success: false, message: '当前密码不正确' });
    }
    logger.error(`修改密码失败: ${error.message}`);
    res.status(500).json({ success: false, message: '密码修改失败' });
  }
};

export default { login, register, recharge, updateProfile, changePassword };
