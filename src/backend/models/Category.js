import db from '../config/db.js';

// 商品分类模型：分类独立成表，与商品构成一对多关系
class Category {
  static format(category) {
    if (!category) return category;
    return {
      id: Number(category.id),
      name: category.name,
      sortOrder: Number(category.sort_order),
      productCount: Number(category.product_count ?? category.productCount ?? 0)
    };
  }

  // 全部分类（含每个分类下的商品数量），按排序值升序
  static async findAll() {
    const [rows] = await db.execute(
      `SELECT c.id, c.name, c.sort_order, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id, c.name, c.sort_order
       ORDER BY c.sort_order ASC, c.id ASC`
    );
    return rows.map(Category.format);
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, name, sort_order FROM categories WHERE id = ?',
      [id]
    );
    return rows[0] ? Category.format({ ...rows[0], product_count: 0 }) : null;
  }

  static async findIdByName(name) {
    const [rows] = await db.execute('SELECT id FROM categories WHERE name = ?', [name]);
    return rows[0] ? Number(rows[0].id) : null;
  }
}

export default Category;
