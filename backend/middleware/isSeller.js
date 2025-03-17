const { User } = require('../models');

module.exports = async (req, res, next) => {
    try {
        // 验证用户是否已登录
        if (!req.user) {
            return res.status(401).json({ message: '未认证，请登录后再试！' });
        }

        // 如果是管理员用户，直接通过中间件
        if (req.user.role === 'admin') {
            return next();
        }

        // 如果是卖家用户，允许通过
        if (req.user.role === 'seller') {
            return next();
        }

        // 否则，返回权限不足错误
        return res.status(403).json({ message: '权限不足！' });
    } catch (error) {
        console.error('Seller Middleware Error:', error);
        return res.status(500).json({ message: '无法验证权限，请稍后再试！' });
    }
};