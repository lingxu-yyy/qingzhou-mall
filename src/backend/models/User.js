import db from '../config/db.js';
import bcrypt from 'bcrypt';

class User {
  static async findByUsername(username) {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async findByPhone(phone) {
    const [rows] = await db.execute('SELECT * FROM users WHERE phone = ?', [phone]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, username, nickname, phone, email, role, points, balance, created_at FROM users WHERE id = ?',
      [id]
    );
    if (!rows[0]) return rows[0];
    return { ...rows[0], points: Number(rows[0].points), balance: Number(rows[0].balance) || 0 };
  }

  static async create(userData) {
    const { username, password, phone } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (username, password, phone) VALUES (?, ?, ?)',
      [username, hashedPassword, phone]
    );
    return result.insertId;
  }

  // 强制使用 bcrypt 校验密码，移除明文回退分支，避免明文存储密码被接受
  // 验证密码
  static async verifyPassword(inputPassword, storedPassword) {
    // 兼容 bcrypt 的 $2a$ / $2b$ 等前缀
    if (!inputPassword || !storedPassword || !storedPassword.startsWith('$2')) {
      return false;
    }
    return bcrypt.compare(inputPassword, storedPassword);
  }

  // 获取用户账户余额
  static async getBalance(userId) {
    const [rows] = await db.execute('SELECT balance FROM users WHERE id = ?', [userId]);
    return rows[0] ? Number(rows[0].balance) : 0;
  }

  // 账户充值（模拟在线充值），金额在控制器校验
  static async addBalance(userId, amount) {
    const safeAmount = Math.round(Number(amount) * 100) / 100;
    if (!(safeAmount > 0)) return 0;
    await db.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [safeAmount, userId]);
    return User.getBalance(userId);
  }

  // 获取用户积分余额
  static async getPoints(userId) {
    const [rows] = await db.execute('SELECT points FROM users WHERE id = ?', [userId]);
    return rows[0] ? Number(rows[0].points) : 0;
  }

  // 扣减积分（仅当余额足够时）
  static async deductPoints(userId, points) {
    const safePoints = Math.max(0, Math.floor(Number(points) || 0));
    if (safePoints <= 0) return true;
    const [result] = await db.execute(
      'UPDATE users SET points = points - ? WHERE id = ? AND points >= ?',
      [safePoints, userId, safePoints]
    );
    return result.affectedRows > 0;
  }

  // 退还积分（取消订单时使用）
  static async refundPoints(userId, points) {
    const safePoints = Math.max(0, Math.floor(Number(points) || 0));
    if (safePoints <= 0) return true;
    const [result] = await db.execute(
      'UPDATE users SET points = points + ? WHERE id = ?',
      [safePoints, userId]
    );
    return result.affectedRows > 0;
  }

  // 更新个人资料（昵称、邮箱）
  static async updateProfile(userId, { nickname, email }) {
    const safeNickname = nickname ? String(nickname).slice(0, 50) : null;
    const safeEmail = email ? String(email).slice(0, 100) : null;
    await db.execute(
      'UPDATE users SET nickname = ?, email = ? WHERE id = ?',
      [safeNickname, safeEmail, userId]
    );
    return User.findById(userId);
  }

  // 修改密码：先校验当前密码，再写入新密码的 bcrypt 哈希
  static async changePassword(userId, oldPassword, newPassword) {
    const [rows] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);
    if (!rows[0]) {
      const error = new Error('用户不存在');
      error.code = 'NOT_FOUND';
      throw error;
    }
    const valid = await bcrypt.compare(oldPassword, rows[0].password);
    if (!valid) {
      const error = new Error('当前密码不正确');
      error.code = 'INVALID_OLD_PASSWORD';
      throw error;
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    return true;
  }
}

export default User;
