const express = require('express');
const router = express.Router();
const internalProductController = require('../controllers/internalProductController');
const authMiddleware = require('../middleware/authMiddleware'); // 验证用户是否登录
const isSeller = require('../middleware/isSeller');   // 验证用户是否为管理员

// 创建内部产品
router.post('/', authMiddleware, isSeller, internalProductController.createInternalProduct);

// 获取当前用户的内部产品
router.get('/', authMiddleware, isSeller, internalProductController.getInternalProducts);
router.get('/products_all', internalProductController.getAllInternalProducts);
router.get('/products/:id' , internalProductController.getProductById);
router.get('/products_search' , internalProductController.dynamicSearch);

// 更新内部产品
router.put('/:id', authMiddleware, isSeller, internalProductController.updateInternalProduct);

// 删除内部产品
router.delete('/:id', authMiddleware, isSeller, internalProductController.deleteInternalProduct);

module.exports = router;