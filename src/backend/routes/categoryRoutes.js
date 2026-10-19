import express from 'express';
import categoryController from '../controllers/categoryController.js';

const router = express.Router();

// 商品分类为公开数据，无需登录
router.get('/', categoryController.getCategories);

export default router;
