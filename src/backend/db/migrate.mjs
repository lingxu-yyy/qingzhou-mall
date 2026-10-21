// ECShop 数据库扩容迁移：4 表 -> 8 表（幂等，可重复执行）
// users 增加 balance；新增 categories / addresses / cart_items / favorites；
// products 增加 category_id 外键；orders 增加 address_id 外键。
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ecshop',
  port: parseInt(process.env.DB_PORT) || 3306
};
const conn = await mysql.createConnection(DB);

const log = (...a) => console.log(...a);

async function columnExists(table, column) {
  const [r] = await conn.query(
    'SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?',
    [DB.database, table, column]
  );
  return r[0].c > 0;
}
async function tableExists(table) {
  const [r] = await conn.query(
    'SELECT COUNT(*) AS c FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME=?',
    [DB.database, table]
  );
  return r[0].c > 0;
}
async function fkExists(name) {
  const [r] = await conn.query(
    'SELECT COUNT(*) AS c FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=? AND CONSTRAINT_NAME=? AND CONSTRAINT_TYPE="FOREIGN KEY"',
    [DB.database, name]
  );
  return r[0].c > 0;
}
async function keyExists(table, keyName) {
  const [r] = await conn.query(
    'SELECT COUNT(*) AS c FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND INDEX_NAME=?',
    [DB.database, table, keyName]
  );
  return r[0].c > 0;
}
async function run(sql, label) {
  await conn.query(sql);
  log('  [OK]', label);
}

// 1. users 增加账户余额
if (!(await columnExists('users', 'balance'))) {
  await run("ALTER TABLE users ADD COLUMN balance DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '账户余额(元)' AFTER points", 'users.balance 已添加');
} else log('  [跳过] users.balance 已存在');

// 2. 商品分类表
if (!(await tableExists('categories'))) {
  await run(`CREATE TABLE categories (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '分类名称',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值(越小越靠前)',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id) USING BTREE,
  UNIQUE KEY uk_category_name (name) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='商品分类表'`, 'categories 表已创建');
} else log('  [跳过] categories 表已存在');

// 3. 收货地址表（需先于 orders.address_id 外键）
if (!(await tableExists('addresses'))) {
  await run(`CREATE TABLE addresses (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '所属用户编号',
  receiver_name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
  phone VARCHAR(20) NOT NULL COMMENT '收货人手机号',
  region VARCHAR(100) DEFAULT NULL COMMENT '所在地区(省/市/区)',
  detail VARCHAR(255) NOT NULL COMMENT '详细地址',
  is_default TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否默认地址:0否1是',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id) USING BTREE,
  KEY idx_address_user (user_id) USING BTREE,
  CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='收货地址表'`, 'addresses 表已创建');
} else log('  [跳过] addresses 表已存在');

// 4. 购物车表
if (!(await tableExists('cart_items'))) {
  await run(`CREATE TABLE cart_items (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '所属用户编号',
  product_id INT NOT NULL COMMENT '商品编号',
  quantity INT NOT NULL DEFAULT 1 COMMENT '购买数量',
  selected TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否勾选结算:0否1是',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id) USING BTREE,
  UNIQUE KEY uk_cart_user_product (user_id, product_id) USING BTREE,
  KEY idx_cart_product (product_id) USING BTREE,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='购物车表'`, 'cart_items 表已创建');
} else log('  [跳过] cart_items 表已存在');

// 5. 商品收藏表
if (!(await tableExists('favorites'))) {
  await run(`CREATE TABLE favorites (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户编号',
  product_id INT NOT NULL COMMENT '商品编号',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id) USING BTREE,
  UNIQUE KEY uk_fav_user_product (user_id, product_id) USING BTREE,
  KEY idx_fav_product (product_id) USING BTREE,
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_fav_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='商品收藏表'`, 'favorites 表已创建');
} else log('  [跳过] favorites 表已存在');

// 6. products 增加 category_id 及外键
if (!(await columnExists('products', 'category_id'))) {
  await run("ALTER TABLE products ADD COLUMN category_id INT NULL COMMENT '所属分类编号' AFTER category", 'products.category_id 列已添加');
} else log('  [跳过] products.category_id 列已存在');
if (!(await keyExists('products', 'idx_category_id'))) {
  await run('ALTER TABLE products ADD KEY idx_category_id (category_id)', 'products.idx_category_id 已添加');
}
if (!(await fkExists('fk_product_category'))) {
  await run('ALTER TABLE products ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL ON UPDATE RESTRICT', 'products->categories 外键已添加');
}

// 7. orders 增加 address_id 及外键
if (!(await columnExists('orders', 'address_id'))) {
  await run("ALTER TABLE orders ADD COLUMN address_id INT NULL COMMENT '所选收货地址编号' AFTER contact_address", 'orders.address_id 列已添加');
} else log('  [跳过] orders.address_id 列已存在');
if (!(await keyExists('orders', 'idx_order_address'))) {
  await run('ALTER TABLE orders ADD KEY idx_order_address (address_id)', 'orders.idx_order_address 已添加');
}
if (!(await fkExists('fk_order_address'))) {
  await run('ALTER TABLE orders ADD CONSTRAINT fk_order_address FOREIGN KEY (address_id) REFERENCES addresses (id) ON DELETE SET NULL ON UPDATE RESTRICT', 'orders->addresses 外键已添加');
}

// 8. 填充分类并回填商品分类关联
await conn.query(`INSERT IGNORE INTO categories (name, sort_order) VALUES
  ('数码产品',1),('家电类',2),('软件类',3),('图书文具',4),
  ('童装',5),('水果类',6),('生鲜蔬菜',7),('零食类',8)`);
const [upd] = await conn.query(`UPDATE products p JOIN categories c ON p.category = c.name
  SET p.category_id = c.id WHERE p.category_id IS NULL`);
log(`  [OK] 回填 products.category_id，影响 ${upd.affectedRows} 行`);

const [[c]] = await conn.query('SELECT COUNT(*) AS c FROM categories');
const [[unlinked]] = await conn.query('SELECT COUNT(*) AS c FROM products WHERE category_id IS NULL');
log(`\n分类数: ${c.c}，未关联分类的商品: ${unlinked.c}`);
log('迁移完成。');
await conn.end();
