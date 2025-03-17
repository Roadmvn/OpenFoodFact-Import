// routes/paypalRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, captureOrder } = require('../controllers/paypalController');

// 创建订单
router.post('/create-order', createOrder);

// 捕获订单支付
router.post('/capture-order/:paypalOrderId', captureOrder);

module.exports = router;