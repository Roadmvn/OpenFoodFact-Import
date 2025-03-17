module.exports = async (req, res, next) => {
    try {
        // 确保用户已通过 Auth Middleware 验证
        if (!req.user) {
            return res.status(401).json({ message: '未认证，请登录后再试！' });
        }

        // 检查用户 role 是否为 "admin"
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: '权限不足，仅管理员可以执行此操作！' });
        }

        // 用户是管理员，继续执行
        next();
    } catch (error) {
        console.error('Admin Middleware Error:', error);
        return res.status(500).json({ message: '无法验证管理员权限，请稍后再试！' });
    }
};