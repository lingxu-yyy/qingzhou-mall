import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    logger.warn(`未授权访问: ${req.path} - IP: ${req.ip}`);
    return res.status(401).json({ success: false, message: '未授权，请先登录' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.warn(`Token验证失败: ${err.message} - IP: ${req.ip}`);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: '登录已过期，请重新登录' });
      }
      return res.status(403).json({ success: false, message: '无效的token' });
    }
    
    req.user = decoded;
    next();
  });
};

export const requireAdmin = (req, res, next) => {
  // 通过 JWT 中的 role 字段判断管理员身份，避免任意用户将 username 改为 admin 即可越权
  if (req.user?.role !== 'admin') {
    logger.warn(`管理员权限校验失败: ${req.user?.username || 'unknown'} (role=${req.user?.role || 'none'}) - IP: ${req.ip}`);
    return res.status(403).json({ success: false, message: '仅管理员可访问此资源' });
  }

  next();
};

export const generateToken = (payload, expiresIn = '1h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

export default authenticateToken;
