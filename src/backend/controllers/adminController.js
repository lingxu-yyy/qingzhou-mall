import db from '../config/db.js';
import Order from '../models/Order.js';
import logger from '../utils/logger.js';

const getOverview = async (req, res) => {
  try {
    const [[userCountRow]] = await db.execute(
      'SELECT COUNT(*) AS totalUsers FROM users'
    );

    const [[productCountRow]] = await db.execute(
      'SELECT COUNT(*) AS totalProducts FROM products'
    );

    const [[orderStatRow]] = await db.execute(
      `SELECT
         COUNT(*) AS totalOrders,
         COALESCE(SUM(CASE WHEN status IN ('已付款','已发货','已完成') THEN final_amount ELSE 0 END), 0) AS totalSales,
         SUM(CASE WHEN status = '已付款' THEN 1 ELSE 0 END) AS pendingShipCount,
         SUM(CASE WHEN status = '已发货' THEN 1 ELSE 0 END) AS shippingCount
       FROM orders`
    );

    res.json({
      success: true,
      data: {
        status: 'ok',
        database: 'connected',
        totalUsers: Number(userCountRow.totalUsers),
        totalProducts: Number(productCountRow.totalProducts),
        totalOrders: Number(orderStatRow.totalOrders || 0),
        totalSales: Number(orderStatRow.totalSales || 0),
        pendingShipCount: Number(orderStatRow.pendingShipCount || 0),
        shippingCount: Number(orderStatRow.shippingCount || 0),
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error(`获取管理端概览失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取管理端概览失败' });
  }
};

const getUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT id, username, phone, role, points, balance, created_at, updated_at
       FROM users
       ORDER BY id DESC`
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error(`获取用户列表失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取用户列表失败' });
  }
};

const getOrders = async (req, res) => {
  try {
    const { status, keyword } = req.query;
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 10;
    page = Math.max(1, page);
    pageSize = Math.min(50, Math.max(1, pageSize));
    const offset = (page - 1) * pageSize;

    const [list, total, statusStats] = await Promise.all([
      Order.findAllAdmin({ status, keyword, limit: pageSize, offset }),
      Order.countAllAdmin({ status, keyword }),
      Order.getStatusStats()
    ]);

    // 附带每个订单的商品明细
    const ordersWithItems = await Promise.all(
      list.map(async (order) => ({
        ...order,
        items: await Order.findItemsByOrderId(order.id)
      }))
    );

    res.json({
      success: true,
      data: ordersWithItems,
      stats: statusStats,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    logger.error(`管理端获取订单列表失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取订单列表失败' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: '订单ID不合法' });
    }

    // 允许的目标状态及前置状态
    const allowedTransitions = {
      已发货: '已付款',
      已完成: '已发货'
    };

    if (!allowedTransitions[status]) {
      return res.status(400).json({ success: false, message: '不支持的订单状态操作' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    if (order.status !== allowedTransitions[status]) {
      return res.status(400).json({
        success: false,
        message: `当前订单状态为"${order.status}"，无法执行该操作`
      });
    }

    await Order.updateStatus(orderId, status);
    logger.info(`管理员更新订单状态: 订单号${order.order_no}, ${order.status} -> ${status}`);

    const updated = await Order.findById(orderId);
    res.json({ success: true, message: '订单状态更新成功', data: updated });
  } catch (error) {
    logger.error(`管理端更新订单状态失败: ${error.message}`);
    res.status(500).json({ success: false, message: '更新订单状态失败' });
  }
};

export default { getOverview, getUsers, getOrders, updateOrderStatus };
