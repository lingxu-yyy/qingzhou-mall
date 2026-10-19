import db from '../config/db.js';

// 购物车模型：购物车持久化到数据库，(user_id, product_id) 唯一
class CartItem {
  // 把一行（含商品快照 JOIN）格式化为前端购物车项；id 取商品 id 以兼容现有前端结构
  static format(row) {
    if (!row) return row;
    return {
      cartId: Number(row.cart_id),
      id: Number(row.product_id),
      productId: Number(row.product_id),
      name: row.name,
      meta: row.meta || '',
      price: Number(row.price),
      image: row.image,
      category: row.category || '',
      stock: Number(row.stock),
      sales: Number(row.sales),
      quantity: Number(row.quantity),
      selected: Number(row.selected) === 1
    };
  }

  static async list(userId) {
    const [rows] = await db.execute(
      `SELECT ci.id AS cart_id, ci.product_id, ci.quantity, ci.selected,
              p.name, p.meta, p.price, p.image, p.category, p.stock, p.sales
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.id DESC`,
      [userId]
    );
    return rows.map(CartItem.format);
  }

  static async count(userId) {
    const [[row]] = await db.execute(
      'SELECT COALESCE(SUM(quantity),0) AS c FROM cart_items WHERE user_id = ?',
      [userId]
    );
    return Number(row.c);
  }

  // 加入购物车：已存在则数量累加，并以库存为上限
  static async add(userId, productId, quantity = 1) {
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const [products] = await db.execute(
      'SELECT id, name, stock FROM products WHERE id = ? FOR UPDATE',
      [productId]
    );
    if (products.length === 0) {
      const error = new Error('商品不存在');
      error.statusCode = 404;
      throw error;
    }
    const stock = Number(products[0].stock);
    if (stock <= 0) {
      const error = new Error('该商品已缺货，无法加入购物车');
      error.statusCode = 400;
      throw error;
    }
    await db.execute(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userId, productId, qty]
    );
    // 累加后以商品库存为上限（stock 列属于 products，需 JOIN 约束）
    await db.execute(
      'UPDATE cart_items ci JOIN products p ON p.id = ci.product_id SET ci.quantity = LEAST(p.stock, ci.quantity) WHERE ci.user_id = ? AND ci.product_id = ?',
      [userId, productId]
    );
    const [rows] = await db.execute(
      `SELECT ci.id AS cart_id, ci.product_id, ci.quantity, ci.selected,
              p.name, p.meta, p.price, p.image, p.category, p.stock, p.sales
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ? AND ci.product_id = ?`,
      [userId, productId]
    );
    return CartItem.format(rows[0]);
  }

  // 修改数量/勾选状态；quantity <= 0 时删除该项
  static async update(userId, cartId, { quantity, selected }) {
    const [owned] = await db.execute(
      'SELECT id, product_id FROM cart_items WHERE id = ? AND user_id = ?',
      [cartId, userId]
    );
    if (owned.length === 0) return null;
    const productId = owned[0].product_id;

    if (quantity !== undefined) {
      const qty = Math.floor(Number(quantity));
      if (!Number.isFinite(qty) || qty <= 0) {
        await db.execute('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [cartId, userId]);
        return { removed: true };
      }
      await db.execute(
        'UPDATE cart_items ci JOIN products p ON p.id = ci.product_id SET ci.quantity = LEAST(p.stock, ?) WHERE ci.id = ? AND ci.user_id = ?',
        [qty, cartId, userId]
      );
    }
    if (selected !== undefined) {
      await db.execute(
        'UPDATE cart_items SET selected = ? WHERE id = ? AND user_id = ?',
        [selected ? 1 : 0, cartId, userId]
      );
    }
    const [rows] = await db.execute(
      `SELECT ci.id AS cart_id, ci.product_id, ci.quantity, ci.selected,
              p.name, p.meta, p.price, p.image, p.category, p.stock, p.sales
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ? AND ci.product_id = ?`,
      [userId, productId]
    );
    return CartItem.format(rows[0]);
  }

  static async remove(userId, cartId) {
    const [result] = await db.execute(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [cartId, userId]
    );
    return result.affectedRows > 0;
  }

  static async clear(userId) {
    await db.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  }

  // 下单成功后清除购物车中已购买的商品
  static async clearProducts(userId, productIds) {
    const ids = (Array.isArray(productIds) ? productIds : [])
      .map((v) => Number(v)).filter(Boolean);
    if (ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    await db.execute(
      `DELETE FROM cart_items WHERE user_id = ? AND product_id IN (${placeholders})`,
      [userId, ...ids]
    );
  }
}

export default CartItem;
