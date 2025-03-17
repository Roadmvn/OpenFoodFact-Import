const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const passport = require('passport');
const { googleLogin } = require('../controllers/authController');


// 注册用户
router.post('/register', register);

// 登录用户
router.post('/login', login);

// 验证登录保护的路由
router.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ message: `Bienvenue, ${req.user.email}！` });
});

// 获取当前登录用户的信息
router.get('/me', authMiddleware, userController.getCurrentUser);

// 登出用户
router.post('/logout', logout);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google 登录回调 URL
router.get('/google/callback', googleLogin);

module.exports = router;