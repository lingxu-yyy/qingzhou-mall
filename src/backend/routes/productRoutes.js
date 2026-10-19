import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

// 商品分类列表（静态路由，必须在 /:id 之前声明，避免被动态路由抢占）
router.get('/categories', productController.getCategories);

router.get('/', productController.getProducts);

router.get('/:id', productController.getProductById);

export default router;
