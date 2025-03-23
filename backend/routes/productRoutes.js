const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// 中间件
const authMiddleware = require('../middleware/authMiddleware'); // 验证用户是否登录
const isAdmin = require('../middleware/isAdmin');   // 验证用户是否为管理员
const isSeller = require('../middleware/isSeller');   // 验证用户是否为管理员

// 新增分页获取产品的路由
router.get('/products',authMiddleware, isSeller, ProductController.getPaginatedProducts);
router.get('/product/:id',authMiddleware, isSeller, ProductController.getProductById);
router.get('/products/searchProducts',authMiddleware, isSeller, ProductController.searchProducts);
router.get('/products/getBrands',authMiddleware, isSeller, ProductController.getPaginatedUniqueBrands);

// Route pour récupérer un produit par code-barres
router.get('/product/barcode/:barcode', authMiddleware, isSeller, ProductController.getProductByBarcode);

// 仅管理员操作
router.post('/', authMiddleware, isSeller, ProductController.createProduct);
router.put('/:id', authMiddleware, isAdmin, ProductController.updateProduct);
router.delete('/:id', authMiddleware, isAdmin, ProductController.deleteProduct);

module.exports = router;