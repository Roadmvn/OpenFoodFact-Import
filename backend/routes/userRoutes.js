const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const {updateUser, getAllUsers, getUserById, updateUserByAdmin} = require("../controllers/userController"); // 导入 UserController
const csrf = require('csurf');

// 配置 CSRF 中间件
const csrfProtection = csrf({ cookie: true });

router.get('/users', authMiddleware, isAdmin, getAllUsers)
router.get('/user/:id', authMiddleware, isAdmin, getUserById)

router.put('/update_user', authMiddleware, csrfProtection, (req, res, next) => {
    console.log("CSRF Token from headers:", req.headers['x-csrf-token']); // 前端传递的 Token
    console.log("CSRF Token from cookies:", req.cookies._csrf); // 后端 Cookie 存储的 Token
    console.log("Session ID:", req.sessionID); // 当前的 Session 信息
    next();
}, updateUser);

router.put('/updateUserByAdmin/:id',authMiddleware, isAdmin, updateUserByAdmin)

router.get('/csrf-token', csrfProtection, (req, res) => {
    res.status(200).json({ csrfToken: req.csrfToken() });
});

module.exports = router;