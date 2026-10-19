import db from '../config/db.js';

// 商品收藏模型：(user_id, product_id) 唯一，一个用户可收藏多个商品
class Favorite {
  static formatProduct(row) {
    if (!row) return row;
    return {
      favoriteId: Number(row.favorite_id),
      id: Number(row.product_id),
      productId: Number(row.product_id),
      name: row.name,
      meta: row.meta || '',
      price: Number(row.price),
      originalPrice: row.original_price != null ? Number(row.original_price) : null,
      image: row.image,
      category: row.category || '',
      stock: Number(row.stock),
      sales: Number(row.sales),
      favoritedAt: row.favorited_at
    };
  }

  // 收藏列表（含商品快照信息）
  static async list(userId) {
    const [rows] = await db.execute(
      `SELECT f.id AS favorite_id, f.product_id, f.created_at AS favorited_at,
              p.name, p.meta, p.price, p.original_price, p.image, p.category, p.stock, p.sales
       FROM favorites f
       JOIN products p ON p.id = f.product_id
       WHERE f.user_id = ?
       ORDER BY f.id DESC`,
      [userId]
    );
    return rows.map(Favorite.formatProduct);
  }

  static async ids(userId) {
    const [rows] = await db.execute(
      'SELECT product_id FROM favorites WHERE user_id = ?',
      [userId]
    );
    return rows.map((r) => Number(r.product_id));
  }

  static async has(userId, productId) {
    const [rows] = await db.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return rows.length > 0;
  }

  // 收藏；已收藏则保持幂等。返回最新收藏状态 true
  static async add(userId, productId) {
    const [products] = await db.execute('SELECT id FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      const error = new Error('商品不存在');
      error.statusCode = 404;
      throw error;
    }
    await db.execute(
      'INSERT IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );
    return true;
  }

  static async remove(userId, productId) {
    const [result] = await db.execute(
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return result.affectedRows > 0;
  }

  // 切换收藏状态，返回切换后的状态（true=已收藏，false=已取消）
  static async toggle(userId, productId) {
    const [products] = await db.execute('SELECT id FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      const error = new Error('商品不存在');
      error.statusCode = 404;
      throw error;
    }
    if (await Favorite.has(userId, productId)) {
      await Favorite.remove(userId, productId);
      return false;
    }
    await Favorite.add(userId, productId);
    return true;
  }
}

export default Favorite;
