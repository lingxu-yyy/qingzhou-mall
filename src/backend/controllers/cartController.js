import CartItem from '../models/CartItem.js';
import logger from '../utils/logger.js';

const list = async (req, res) => {
  try {
    const [data, totalCount] = await Promise.all([
      CartItem.list(req.user.userId),
      CartItem.count(req.user.userId)
    ]);
    res.json({ success: true, data, totalCount });
  } catch (error) {
    logger.error(`获取购物车失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取购物车失败' });
  }
};

const add = async (req, res) => {
  try {
    const productId = parseInt(req.body.productId);
    const quantity = parseInt(req.body.quantity) || 1;
    if (!productId) return res.status(400).json({ success: false, message: '商品ID不合法' });
    if (quantity < 1) return res.status(400).json({ success: false, message: '购买数量不合法' });
    const item = await CartItem.add(req.user.userId, productId, quantity);
    const totalCount = await CartItem.count(req.user.userId);
    res.status(201).json({ success: true, message: '已加入购物车', data: item, totalCount });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error(`加入购物车失败: ${error.message}`);
    res.status(statusCode).json({ success: false, message: statusCode === 500 ? '加入购物车失败' : error.message });
  }
};

const update = async (req, res) => {
  try {
    const cartId = parseInt(req.params.id);
    if (!cartId) return res.status(400).json({ success: false, message: '购物车项ID不合法' });
    const { quantity, selected } = req.body;
    const result = await CartItem.update(req.user.userId, cartId, { quantity, selected });
    if (!result) return res.status(404).json({ success: false, message: '购物车商品不存在' });
    if (result.removed) return res.json({ success: true, message: '已从购物车移除', data: { removed: true } });
    res.json({ success: true, message: '购物车已更新', data: result });
  } catch (error) {
    logger.error(`更新购物车失败: ${error.message}`);
    res.status(500).json({ success: false, message: '更新购物车失败' });
  }
};

const remove = async (req, res) => {
  try {
    const cartId = parseInt(req.params.id);
    if (!cartId) return res.status(400).json({ success: false, message: '购物车项ID不合法' });
    const ok = await CartItem.remove(req.user.userId, cartId);
    if (!ok) return res.status(404).json({ success: false, message: '购物车商品不存在' });
    res.json({ success: true, message: '已从购物车移除' });
  } catch (error) {
    logger.error(`删除购物车商品失败: ${error.message}`);
    res.status(500).json({ success: false, message: '删除购物车商品失败' });
  }
};

const clear = async (req, res) => {
  try {
    await CartItem.clear(req.user.userId);
    res.json({ success: true, message: '购物车已清空' });
  } catch (error) {
    logger.error(`清空购物车失败: ${error.message}`);
    res.status(500).json({ success: false, message: '清空购物车失败' });
  }
};

export default { list, add, update, remove, clear };
