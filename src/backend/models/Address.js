import db from '../config/db.js';

// 收货地址模型：一个用户可维护多个收货地址，其中至多一个默认地址
class Address {
  static format(addr) {
    if (!addr) return addr;
    return {
      id: Number(addr.id),
      userId: Number(addr.user_id),
      receiverName: addr.receiver_name,
      phone: addr.phone,
      region: addr.region || '',
      detail: addr.detail,
      isDefault: Number(addr.is_default) === 1,
      createdAt: addr.created_at,
      updatedAt: addr.updated_at
    };
  }

  static async list(userId) {
    const [rows] = await db.execute(
      `SELECT id, user_id, receiver_name, phone, region, detail, is_default, created_at, updated_at
       FROM addresses WHERE user_id = ?
       ORDER BY is_default DESC, id DESC`,
      [userId]
    );
    return rows.map(Address.format);
  }

  static async findOwned(id, userId) {
    const [rows] = await db.execute(
      `SELECT id, user_id, receiver_name, phone, region, detail, is_default, created_at, updated_at
       FROM addresses WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return rows[0] ? Address.format(rows[0]) : null;
  }

  // 取消该用户其它默认地址（在事务连接或默认连接上执行）
  static async clearDefault(conn, userId) {
    const dbOrConn = conn || db;
    await dbOrConn.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
  }

  static async create(userId, { receiverName, phone, region = null, detail, isDefault = false }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // 若设为默认，或用户尚无任何地址，则把新地址置为默认
      let makeDefault = isDefault ? 1 : 0;
      const [[cnt]] = await conn.execute('SELECT COUNT(*) AS c FROM addresses WHERE user_id = ?', [userId]);
      if (cnt.c === 0) makeDefault = 1;
      if (makeDefault === 1) {
        await Address.clearDefault(conn, userId);
      }
      const [result] = await conn.execute(
        `INSERT INTO addresses (user_id, receiver_name, phone, region, detail, is_default)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, receiverName, phone, region || null, detail, makeDefault]
      );
      await conn.commit();
      return Address.findOwned(result.insertId, userId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async update(id, userId, { receiverName, phone, region = null, detail, isDefault }) {
    const existing = await Address.findOwned(id, userId);
    if (!existing) return null;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      if (isDefault === true) {
        await Address.clearDefault(conn, userId);
      }
      await conn.execute(
        `UPDATE addresses SET receiver_name = ?, phone = ?, region = ?, detail = ?, is_default = ?
         WHERE id = ? AND user_id = ?`,
        [
          receiverName ?? existing.receiverName,
          phone ?? existing.phone,
          region === undefined ? existing.region : (region || null),
          detail ?? existing.detail,
          isDefault === true ? 1 : (isDefault === false ? 0 : (existing.isDefault ? 1 : 0)),
          id,
          userId
        ]
      );
      await conn.commit();
      return Address.findOwned(id, userId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async setDefault(id, userId) {
    const existing = await Address.findOwned(id, userId);
    if (!existing) return null;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await Address.clearDefault(conn, userId);
      await conn.execute('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?', [id, userId]);
      await conn.commit();
      return Address.findOwned(id, userId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async remove(id, userId) {
    const existing = await Address.findOwned(id, userId);
    if (!existing) return false;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
      // 删除的是默认地址时，把剩余地址中最新的一条设为默认
      if (existing.isDefault) {
        const [[cnt]] = await conn.execute('SELECT COUNT(*) AS c FROM addresses WHERE user_id = ?', [userId]);
        if (cnt.c > 0) {
          const [[next]] = await conn.execute(
            'SELECT id FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1',
            [userId]
          );
          if (next) await conn.execute('UPDATE addresses SET is_default = 1 WHERE id = ?', [next.id]);
        }
      }
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

export default Address;
