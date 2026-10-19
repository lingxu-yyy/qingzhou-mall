import Order from '../models/Order.js';
import CartItem from '../models/CartItem.js';
import logger from '../utils/logger.js';

const VALID_PAYMENT_METHODS = ['wechat', 'alipay', 'wallet'];

const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, contactName, contactPhone, contactAddress, addressId, pointsUsed, remark, fromCart } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: '订单商品不能为空' });
    }

    if (items.some((item) => !item.product_id || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0)) {
      return res.status(400).json({ success: false, message: '商品或购买数量不合法' });
    }

    const method = VALID_PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : 'alipay';

    if (!contactName || !contactPhone || !contactAddress) {
      return res.status(400).json({ success: false, message: '请填写完整的收货信息(收货人、电话、地址)' });
    }

    if (!/^1[3-9]\d{9}$/.test(contactPhone)) {
      return res.status(400).json({ success: false, message: '收货人手机号格式不正确' });
    }

    const { order, orderItems } = await Order.create(userId, {
      items,
      paymentMethod: method,
      contactName,
      contactPhone,
      contactAddress,
      addressId: addressId ? Number(addressId) : null,
      pointsUsed: Number(pointsUsed) || 0,
      remark: remark || null
    });

    // 从购物车结算的订单，下单成功后清除购物车中已购买的商品
    if (fromCart) {
      await CartItem.clearProducts(userId, orderItems.map((it) => it.product_id));
    }

    logger.info(`订单创建成功: 订单号${order.order_no}, 用户ID:${userId}, 实付:${order.final_amount}元`);
    res.status(201).json({ success: true, message: '订单创建成功', data: { ...order, items: orderItems } });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error(`创建订单失败: ${error.message}`);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? '创建订单失败' : error.message
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user.userId);

    // 附带每个订单的明细
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: await Order.findItemsByOrderId(order.id)
      }))
    );

    res.json({ success: true, data: ordersWithItems });
  } catch (error) {
    logger.error(`获取订单列表失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取订单列表失败' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (!orderId) {
      return res.status(400).json({ success: false, message: '订单ID不合法' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    if (order.user_id !== req.user.userId) {
      logger.warn(`越权访问订单: 用户${req.user.userId} 尝试访问订单${orderId}(属于用户${order.user_id})`);
      return res.status(403).json({ success: false, message: '无权查看该订单' });
    }

    const items = await Order.findItemsByOrderId(orderId);
    res.json({ success: true, data: { ...order, items } });
  } catch (error) {
    logger.error(`获取订单详情失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取订单详情失败' });
  }
};

const payOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (!orderId) {
      return res.status(400).json({ success: false, message: '订单ID不合法' });
    }

    // 支付在事务内完成：钱包支付需校验并扣减余额，支付宝/微信为模拟支付
    const result = await Order.pay(orderId, req.user.userId);
    const msg = result.walletPaid
      ? `支付成功，已从钱包扣款 ${Number(result.paidAmount).toFixed(2)} 元`
      : '支付成功';
    logger.info(`订单支付成功: 订单号${result.order_no}, 用户ID:${req.user.userId}, 钱包扣款:${result.walletPaid}`);

    const updated = await Order.findById(orderId);
    res.json({ success: true, message: msg, data: updated });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    if (error.code === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: '无权操作该订单' });
    }
    if (error.code === 'INVALID_STATUS') {
      return res.status(400).json({ success: false, message: `当前订单状态为"${error.status}"，无需支付` });
    }
    const statusCode = error.statusCode || 500;
    logger.error(`订单支付失败: ${error.message}`);
    res.status(statusCode).json({ success: false, message: statusCode === 500 ? '订单支付失败' : error.message });
  }
};

const completeOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (!orderId) {
      return res.status(400).json({ success: false, message: '订单ID不合法' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    if (order.user_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: '无权操作该订单' });
    }

    if (order.status !== '已发货') {
      return res.status(400).json({ success: false, message: `当前订单状态为"${order.status}"，不能确认收货` });
    }

    await Order.updateStatus(orderId, '已完成');
    logger.info(`订单确认收货: 订单号${order.order_no}, 用户ID:${req.user.userId}`);

    const updated = await Order.findById(orderId);
    res.json({ success: true, message: '确认收货成功', data: updated });
  } catch (error) {
    logger.error(`确认收货失败: ${error.message}`);
    res.status(500).json({ success: false, message: '确认收货失败' });
  }
};

// 取消订单：还原库存并退还积分
const cancelOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (!orderId) {
      return res.status(400).json({ success: false, message: '订单ID不合法' });
    }

    const result = await Order.cancelOrder(orderId, req.user.userId);
    let msg = '订单已取消';
    if (result.points_refunded > 0) {
      msg += `，已退还 ${result.points_refunded} 积分`;
    }
    if (Number(result.wallet_refunded) > 0) {
      msg += `，已退回钱包 ${Number(result.wallet_refunded).toFixed(2)} 元`;
    }
    logger.info(`订单取消成功: 订单号${result.order_no}, 用户ID:${req.user.userId}`);

    const updated = await Order.findById(orderId);
    res.json({ success: true, message: msg, data: updated });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    if (error.code === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: '无权操作该订单' });
    }
    if (error.code === 'INVALID_STATUS') {
      return res.status(400).json({ success: false, message: `当前订单状态为"${error.status}"，无法取消` });
    }
    logger.error(`订单取消失败: ${error.message}`);
    res.status(500).json({ success: false, message: '订单取消失败' });
  }
};

export default { createOrder, getMyOrders, getOrderById, payOrder, completeOrder, cancelOrder };
