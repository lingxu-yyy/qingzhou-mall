import db from '../config/db.js';
import crypto from 'crypto';
import User from './User.js';

class Order {
  // 生成订单编号：O + 年月日 + 8位随机十六进制，降低高并发碰撞概率
  static generateOrderNo() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `O${date}${rand}`;
  }

  static formatOrder(order) {
    if (!order) return order;
    return {
      ...order,
      total_amount: Number(order.total_amount),
      points_discount: Number(order.points_discount),
      final_amount: Number(order.final_amount),
      points_used: Number(order.points_used)
    };
  }

  static formatItem(item) {
    if (!item) return item;
    return {
      ...item,
      price: Number(item.price),
      quantity: Number(item.quantity),
      subtotal: Number(item.subtotal)
    };
  }

  static async create(userId, payload) {
    const {
      items,
      paymentMethod = 'alipay',
      contactName = null,
      contactPhone = null,
      contactAddress = null,
      addressId = null,
      pointsUsed = 0,
      remark = null
    } = payload;

    // 合并同一商品的购买数量
    const quantityMap = new Map();
    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error('订单商品列表不能为空');
      error.statusCode = 400;
      throw error;
    }
    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);
      if (!productId || !quantity || quantity <= 0) {
        const error = new Error('商品或数量不合法');
        error.statusCode = 400;
        throw error;
      }
      quantityMap.set(productId, (quantityMap.get(productId) || 0) + quantity);
    }

    const productIds = [...quantityMap.keys()];

    // 校验积分：必须为非负整数，且不超过用户当前积分余额
    const points = Math.max(0, Math.floor(Number(pointsUsed) || 0));
    if (points > 0) {
      const userPoints = await User.getPoints(userId);
      if (userPoints < points) {
        const error = new Error(`积分不足，当前可用积分 ${userPoints}`);
        error.statusCode = 400;
        throw error;
      }
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 在事务内对商品行加排他锁（FOR UPDATE），避免并发下单的 TOCTOU
      const placeholders = productIds.map(() => '?').join(',');
      const [productRows] = await conn.execute(
        `SELECT id, name, price, stock, image FROM products WHERE id IN (${placeholders}) FOR UPDATE`,
        productIds
      );

      if (productRows.length !== productIds.length) {
        const foundIds = new Set(productRows.map((p) => p.id));
        const missingId = productIds.find((id) => !foundIds.has(id));
        const error = new Error(`商品不存在(id:${missingId})`);
        error.statusCode = 400;
        throw error;
      }

      let totalAmount = 0;
      const orderItems = productRows.map((product) => {
        const quantity = quantityMap.get(product.id);

        if (Number(product.stock) < quantity) {
          const error = new Error(`商品"${product.name}"库存不足，剩余${product.stock}件`);
          error.statusCode = 400;
          throw error;
        }

        const unitPrice = Number(product.price);
        const subtotal = Math.round(unitPrice * quantity * 100) / 100;
        totalAmount += subtotal;

        return {
          product_id: product.id,
          product_name: product.name,
          product_image: product.image,
          price: unitPrice,
          quantity,
          subtotal
        };
      });

      totalAmount = Math.round(totalAmount * 100) / 100;

      // 积分抵扣：1积分抵0.01元，最多抵扣到订单总额
      const pointsDiscount = Math.min(Math.round(points * 0.01 * 100) / 100, totalAmount);
      const finalAmount = Math.max(0, Math.round((totalAmount - pointsDiscount) * 100) / 100);

      // 订单编号冲突时重试多次，降低碰撞导致下单失败的概率
      let orderId;
      let orderNo;
      for (let attempt = 0; attempt < 5; attempt++) {
        orderNo = Order.generateOrderNo();
        try {
          const [result] = await conn.execute(
            `INSERT INTO orders
             (order_no, user_id, total_amount, points_used, points_discount, final_amount, status, payment_method, contact_name, contact_phone, contact_address, address_id, remark)
             VALUES (?, ?, ?, ?, ?, ?, '已下单', ?, ?, ?, ?, ?, ?)`,
            [orderNo, userId, totalAmount, points, pointsDiscount, finalAmount, paymentMethod, contactName, contactPhone, contactAddress, addressId, remark]
          );
          orderId = result.insertId;
          break;
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY' && attempt < 4) {
            continue;
          }
          throw err;
        }
      }

      // 写入订单明细，同时扣减库存、累加销量
      for (const item of orderItems) {
        await conn.execute(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.product_name, item.product_image, item.price, item.quantity, item.subtotal]
        );

        const [stockResult] = await conn.execute(
          `UPDATE products SET stock = stock - ?, sales = sales + ? WHERE id = ? AND stock >= ?`,
          [item.quantity, item.quantity, item.product_id, item.quantity]
        );

        if (stockResult.affectedRows === 0) {
          const error = new Error(`商品"${item.product_name}"库存不足`);
          error.statusCode = 400;
          throw error;
        }
      }

      // 扣减用户积分（事务内，确保原子性）
      if (points > 0) {
        const [pointsResult] = await conn.execute(
          'UPDATE users SET points = points - ? WHERE id = ? AND points >= ?',
          [points, userId, points]
        );
        if (pointsResult.affectedRows === 0) {
          const error = new Error('积分扣减失败，余额不足');
          error.statusCode = 400;
          throw error;
        }
      }

      await conn.commit();

      const order = Order.formatOrder({
        id: orderId,
        order_no: orderNo,
        user_id: userId,
        total_amount: totalAmount,
        points_used: points,
        points_discount: pointsDiscount,
        final_amount: finalAmount,
        status: '已下单',
        payment_method: paymentMethod,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_address: contactAddress,
        address_id: addressId,
        remark
      });

      return { order, orderItems: orderItems.map(Order.formatItem) };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async findByUserId(userId) {
    const [orders] = await db.execute(
      `SELECT id, order_no, user_id, total_amount, points_used, points_discount, final_amount, status, payment_method, contact_name, contact_phone, contact_address, remark, created_at
       FROM orders WHERE user_id = ? ORDER BY id DESC`,
      [userId]
    );
    return orders.map(Order.formatOrder);
  }

  static async findById(orderId) {
    const [orders] = await db.execute(
      `SELECT id, order_no, user_id, total_amount, points_used, points_discount, final_amount, status, payment_method, contact_name, contact_phone, contact_address, remark, created_at, updated_at
       FROM orders WHERE id = ?`,
      [orderId]
    );
    return Order.formatOrder(orders[0]);
  }

  static async findItemsByOrderId(orderId) {
    const [items] = await db.execute(
      `SELECT id, order_id, product_id, product_name, product_image, price, quantity, subtotal
       FROM order_items WHERE order_id = ? ORDER BY id ASC`,
      [orderId]
    );
    return items.map(Order.formatItem);
  }

  static async updateStatus(orderId, status) {
    const [result] = await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );
    return result.affectedRows > 0;
  }

  // 支付订单：支付宝/微信为模拟支付；钱包支付在事务内扣减账户余额，保证不超支
  static async pay(orderId, userId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [orderRows] = await conn.execute(
        'SELECT id, order_no, user_id, status, payment_method, final_amount FROM orders WHERE id = ? FOR UPDATE',
        [orderId]
      );
      if (orderRows.length === 0) {
        throw { code: 'NOT_FOUND' };
      }
      const order = orderRows[0];
      if (order.user_id !== userId) {
        throw { code: 'FORBIDDEN' };
      }
      if (order.status !== '已下单') {
        throw { code: 'INVALID_STATUS', status: order.status };
      }

      let walletPaid = false;
      const finalAmount = Number(order.final_amount);
      if (order.payment_method === 'wallet') {
        const [userRows] = await conn.execute(
          'SELECT balance FROM users WHERE id = ? FOR UPDATE',
          [userId]
        );
        if (userRows.length === 0) {
          throw { code: 'NOT_FOUND' };
        }
        const balance = Number(userRows[0].balance);
        if (balance < finalAmount) {
          const error = new Error(`钱包余额不足，当前余额 ${balance.toFixed(2)} 元，应付 ${finalAmount.toFixed(2)} 元`);
          error.statusCode = 400;
          throw error;
        }
        const [deducted] = await conn.execute(
          'UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?',
          [finalAmount, userId, finalAmount]
        );
        if (deducted.affectedRows === 0) {
          const error = new Error('钱包余额不足');
          error.statusCode = 400;
          throw error;
        }
        walletPaid = true;
      }

      await conn.execute("UPDATE orders SET status = '已付款' WHERE id = ?", [orderId]);
      await conn.commit();
      return { order_no: order.order_no, walletPaid, paidAmount: finalAmount };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  // 取消订单：还原库存、退还积分；已付款且为钱包支付的订单同时退还钱包余额
  static async cancelOrder(orderId, userId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 锁定订单行，防止并发取消
      const [orderRows] = await conn.execute(
        `SELECT id, order_no, user_id, status, payment_method, final_amount, points_used FROM orders WHERE id = ? FOR UPDATE`,
        [orderId]
      );
      if (orderRows.length === 0) {
        throw { code: 'NOT_FOUND' };
      }
      const order = orderRows[0];
      if (order.user_id !== userId) {
        throw { code: 'FORBIDDEN' };
      }
      if (order.status !== '已下单' && order.status !== '已付款') {
        throw { code: 'INVALID_STATUS', status: order.status };
      }

      // 还原库存与销量（与下单时 stock-、sales+ 对应回滚）
      const [items] = await conn.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      );
      for (const item of items) {
        await conn.execute(
          'UPDATE products SET stock = stock + ?, sales = GREATEST(sales - ?, 0) WHERE id = ?',
          [item.quantity, item.quantity, item.product_id]
        );
      }

      // 退还积分
      const pointsUsed = Number(order.points_used) || 0;
      if (pointsUsed > 0) {
        await conn.execute(
          'UPDATE users SET points = points + ? WHERE id = ?',
          [pointsUsed, userId]
        );
      }

      // 已付款且使用钱包支付的订单，取消时把实付金额退回钱包；未付款订单未扣款不退
      let walletRefunded = 0;
      if (order.status === '已付款' && order.payment_method === 'wallet') {
        walletRefunded = Number(order.final_amount) || 0;
        if (walletRefunded > 0) {
          await conn.execute(
            'UPDATE users SET balance = balance + ? WHERE id = ?',
            [walletRefunded, userId]
          );
        }
      }

      await conn.execute('UPDATE orders SET status = ? WHERE id = ?', ['已取消', orderId]);
      await conn.commit();
      return { order_no: order.order_no, points_refunded: pointsUsed, wallet_refunded: walletRefunded };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async findAllAdmin({ status, keyword, limit = 10, offset = 0 } = {}) {
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }

    if (keyword && keyword.trim()) {
      conditions.push('(o.order_no LIKE ? OR u.username LIKE ? OR o.contact_name LIKE ? OR o.contact_phone LIKE ?)');
      const like = `%${keyword.trim()}%`;
      params.push(like, like, like, like);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
    const safeOffset = Math.max(0, Number(offset) || 0);

    const [rows] = await db.execute(
      `SELECT o.id, o.order_no, o.user_id, u.username AS user_name, o.total_amount, o.points_used,
              o.points_discount, o.final_amount, o.status, o.payment_method,
              o.contact_name, o.contact_phone, o.contact_address, o.remark, o.created_at
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ${where}
       ORDER BY o.id DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );

    return rows.map(Order.formatOrder);
  }

  static async countAllAdmin({ status, keyword } = {}) {
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }

    if (keyword && keyword.trim()) {
      conditions.push('(o.order_no LIKE ? OR u.username LIKE ? OR o.contact_name LIKE ? OR o.contact_phone LIKE ?)');
      const like = `%${keyword.trim()}%`;
      params.push(like, like, like, like);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await db.execute(
      `SELECT COUNT(*) AS total FROM orders o LEFT JOIN users u ON u.id = o.user_id ${where}`,
      params
    );

    return Number(rows[0].total);
  }

  static async getStatusStats() {
    const [rows] = await db.execute(
      `SELECT status, COUNT(*) AS count, COALESCE(SUM(final_amount), 0) AS amount
       FROM orders GROUP BY status`
    );
    return rows.map((row) => ({
      status: row.status,
      count: Number(row.count),
      amount: Number(row.amount)
    }));
  }
}

export default Order;
