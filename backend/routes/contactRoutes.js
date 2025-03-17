const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware'); // 验证用户是否登录

// 创建 `Contact`
router.post('/', contactController.createContact);

// 获取买家的所有 `Contact`
router.get('/buyer', authMiddleware, contactController.getBuyerContacts);

// 获取卖家的所有 `Contact`
router.get('/seller', authMiddleware, contactController.getSellerContacts);

// 更新 `Contact` 状态
router.patch('/:id/status', authMiddleware, contactController.updateContactStatus);

module.exports = router;