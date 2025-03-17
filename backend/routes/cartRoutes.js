const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware'); // 验证用户是否登录

// 获取购物车
router.get('/', authMiddleware, cartController.getCart);

// 添加产品到购物车
router.post('/', authMiddleware, cartController.addToCart);

// 更新购物车产品数量
router.put('/:id', authMiddleware, cartController.updateCartItem);

// 删除购物车中的某个产品
router.delete('/:id', authMiddleware, cartController.deleteCartItem);

// 清空购物车
router.delete('/', authMiddleware, cartController.clearCart);

module.exports = router;