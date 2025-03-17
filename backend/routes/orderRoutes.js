const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // 验证用户是否登录
const isSeller = require('../middleware/isSeller');   // 验证用户是否为管理员
const isAdmin = require('../middleware/isAdmin');   // 验证用户是否为管理员

const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getOrdersByBuyer,
    getOrdersBySeller,
    getUsersBySeller,
    createOrderForBuyer
} = require('../controllers/orderController'); // 确保路径正确

// 创建订单
router.post('/', authMiddleware, createOrder);

// 获取所有订单
router.get('/', authMiddleware, isAdmin, getAllOrders);

// 根据 ID 获取单个订单
router.get('/:id', authMiddleware, getOrderById);

// 更新订单状态
router.put('/:id', authMiddleware, updateOrderStatus);

// 删除订单
router.delete('/:id', authMiddleware, deleteOrder);

// 买家获取属于自己的订单
router.get('/buyer/me', authMiddleware, getOrdersByBuyer);

// 卖家获取属于自己的订单
router.get('/seller/me', authMiddleware, getOrdersBySeller);

router.get('/seller/users', authMiddleware, getUsersBySeller);
router.post('/seller/create_order', authMiddleware, isSeller, createOrderForBuyer);


module.exports = router;