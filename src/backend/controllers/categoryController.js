import Category from '../models/Category.js';
import logger from '../utils/logger.js';

const getCategories = async (req, res) => {
  try {
    const data = await Category.findAll();
    res.json({ success: true, data });
  } catch (error) {
    logger.error(`获取商品分类失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取商品分类失败' });
  }
};

export default { getCategories };
