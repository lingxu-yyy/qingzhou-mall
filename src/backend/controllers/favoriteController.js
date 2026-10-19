import Favorite from '../models/Favorite.js';
import logger from '../utils/logger.js';

const list = async (req, res) => {
  try {
    const data = await Favorite.list(req.user.userId);
    res.json({ success: true, data });
  } catch (error) {
    logger.error(`获取收藏列表失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取收藏列表失败' });
  }
};

const ids = async (req, res) => {
  try {
    const data = await Favorite.ids(req.user.userId);
    res.json({ success: true, data });
  } catch (error) {
    logger.error(`获取收藏ID失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取收藏ID失败' });
  }
};

const add = async (req, res) => {
  try {
    const productId = parseInt(req.body.productId);
    if (!productId) return res.status(400).json({ success: false, message: '商品ID不合法' });
    await Favorite.add(req.user.userId, productId);
    res.status(201).json({ success: true, message: '已收藏', data: { productId, favorited: true } });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error(`收藏失败: ${error.message}`);
    res.status(statusCode).json({ success: false, message: statusCode === 500 ? '收藏失败' : error.message });
  }
};

const toggle = async (req, res) => {
  try {
    const productId = parseInt(req.body.productId);
    if (!productId) return res.status(400).json({ success: false, message: '商品ID不合法' });
    const favorited = await Favorite.toggle(req.user.userId, productId);
    res.json({ success: true, message: favorited ? '已收藏' : '已取消收藏', data: { productId, favorited } });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error(`切换收藏失败: ${error.message}`);
    res.status(statusCode).json({ success: false, message: statusCode === 500 ? '操作失败' : error.message });
  }
};

const remove = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (!productId) return res.status(400).json({ success: false, message: '商品ID不合法' });
    await Favorite.remove(req.user.userId, productId);
    res.json({ success: true, message: '已取消收藏', data: { productId, favorited: false } });
  } catch (error) {
    logger.error(`取消收藏失败: ${error.message}`);
    res.status(500).json({ success: false, message: '取消收藏失败' });
  }
};

export default { list, ids, add, toggle, remove };
