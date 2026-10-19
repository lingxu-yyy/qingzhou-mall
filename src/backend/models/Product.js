import db from '../config/db.js';

class Product {
  // 将 mysql2 返回的 DECIMAL 字符串字段转为数字
  static format(product) {
    if (!product) return product;
    return {
      ...product,
      price: Number(product.price),
      original_price: product.original_price != null ? Number(product.original_price) : null,
      stock: Number(product.stock),
      sales: Number(product.sales),
      category_id: product.category_id != null ? Number(product.category_id) : null
    };
  }

  // 转义 LIKE 模糊查询中的通配符，避免用户输入 %/_ 干扰匹配结果
  static escapeLike(keyword) {
    return String(keyword).replace(/[%_\\]/g, '\\$&');
  }

  static async findAll({ category, categoryId, keyword, limit = 12, offset = 0 } = {}) {
    const conditions = [];
    const params = [];

    if (categoryId && Number(categoryId)) {
      conditions.push('category_id = ?');
      params.push(Number(categoryId));
    } else if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (keyword && keyword.trim()) {
      // 限制关键词长度，避免超长字符串拖慢数据库 LIKE 查询
      const safeKeyword = keyword.trim().slice(0, 50);
      conditions.push('(name LIKE ? ESCAPE \'\\\\\' OR meta LIKE ? ESCAPE \'\\\\\')');
      const like = `%${Product.escapeLike(safeKeyword)}%`;
      params.push(like, like);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // LIMIT/OFFSET 整数化与范围校验，直接内联（mysql2 预处理语句对 LIMIT 占位符支持有缺陷）
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 12));
    const safeOffset = Math.max(0, Number(offset) || 0);

    const [rows] = await db.execute(
      `SELECT id, name, meta, price, original_price, image, category, category_id, stock, sales, created_at
       FROM products
       ${where}
       ORDER BY id ASC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );

    return rows.map(Product.format);
  }

  static async count({ category, categoryId, keyword } = {}) {
    const conditions = [];
    const params = [];

    if (categoryId && Number(categoryId)) {
      conditions.push('category_id = ?');
      params.push(Number(categoryId));
    } else if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (keyword && keyword.trim()) {
      // 限制关键词长度，避免超长字符串拖慢数据库 LIKE 查询
      const safeKeyword = keyword.trim().slice(0, 50);
      conditions.push('(name LIKE ? ESCAPE \'\\\\\' OR meta LIKE ? ESCAPE \'\\\\\')');
      const like = `%${Product.escapeLike(safeKeyword)}%`;
      params.push(like, like);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await db.execute(
      `SELECT COUNT(*) AS total FROM products ${where}`,
      params
    );

    return Number(rows[0].total);
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT id, name, meta, description, price, original_price, image, category, category_id, stock, sales, created_at, updated_at
       FROM products WHERE id = ?`,
      [id]
    );
    return Product.format(rows[0]);
  }

  static async findByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await db.execute(
      `SELECT id, name, meta, price, original_price, image, category, category_id, stock, sales
       FROM products WHERE id IN (${placeholders})`,
      ids
    );
    return rows.map(Product.format);
  }

  // 分类列表来自独立的 categories 表，并统计每个分类下的商品数量
  static async getCategories() {
    const [rows] = await db.execute(
      `SELECT c.id, c.name, c.sort_order, COUNT(p.id) AS productCount
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id, c.name, c.sort_order
       ORDER BY c.sort_order ASC, c.id ASC`
    );
    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      sortOrder: Number(row.sort_order),
      productCount: Number(row.productCount)
    }));
  }
}

export default Product;
