import Product from '../models/Product.js';
import logger from '../utils/logger.js';

// 分页参数安全处理
const parsePagination = (query) => {
  let page = parseInt(query.page) || 1;
  let pageSize = parseInt(query.pageSize) || 12;
  page = Math.max(1, page);
  pageSize = Math.min(50, Math.max(1, pageSize));
  return { page, pageSize, offset: (page - 1) * pageSize };
};

const getProducts = async (req, res) => {
  try {
    const { category, categoryId, keyword } = req.query;
    const { page, pageSize, offset } = parsePagination(req.query);

    const [list, total] = await Promise.all([
      Product.findAll({ category, categoryId, keyword, limit: pageSize, offset }),
      Product.count({ category, categoryId, keyword })
    ]);

    res.json({
      success: true,
      data: list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    logger.error(`获取商品列表失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取商品列表失败' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Product.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    logger.error(`获取商品分类失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取商品分类失败' });
  }
};

const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: '商品ID不合法' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    logger.error(`获取商品详情失败: ${error.message}`);
    res.status(500).json({ success: false, message: '获取商品详情失败' });
  }
};

export default { getProducts, getCategories, getProductById };
