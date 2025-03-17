const express = require('express');
const router = express.Router();
const {
    createInvoice,
    getInvoiceById,
    getAllInvoices,
    updateInvoice,
    deleteInvoice,
    getUserInvoicesWithDetails,
    getSellerInvoices,
} = require('../controllers/invoiceController'); // 引入控制器

// 中间件示例 (用于身份验证)
const authMiddleware = require('../middleware/authMiddleware'); // 验证用户是否登录
const isSeller = require('../middleware/isSeller');   // 验证用户是否为管理员
const isAdmin = require('../middleware/isAdmin');   // 验证用户是否为管理员

// 创建发票
router.post('/', authMiddleware, isSeller, createInvoice); // 普通用户创建发票

// 获取特定发票详情
router.get('/:id', authMiddleware, isSeller, getInvoiceById); // 获取单独的发票（需身份认证）

// 用户专属 - 获取自己的发票
router.get('/user/me', authMiddleware, getUserInvoicesWithDetails); // 获取当前用户的所有发票

// 卖家专属 - 获取自己的发票
router.get('/seller/me', authMiddleware, isSeller, getSellerInvoices); // 卖家获取与自己相关的发票

// 管理员相关路由
// 获取所有发票
router.get('/', authMiddleware, isAdmin, getAllInvoices); // 仅管理员能查看所有发票

// 更新发票
router.put('/:id', authMiddleware, isSeller, updateInvoice); // 仅管理员可以更新发票

// 删除发票
router.delete('/:id', authMiddleware, isSeller, deleteInvoice); // 仅管理员能删除发票

module.exports = router;