const jwt = require('jsonwebtoken');
const { User } = require('../models'); 
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// JWT SECRET KEY depuis les variables d'environnement
const JWT_SECRET_KEY = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Non autorisé！' });
        }

        // 1. 从 Authorization 头部或 Cookie 中获取 Token
        let token = null;

        // 首先尝试从 Authorization Header 获取 Token
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            // 如果没有 Header，尝试从 Cookies 获取
            token = req.cookies.token;
        }

        // 如果仍然没有 Token
        if (!token) {
            return res
                .status(401)
                .json({ message: '缺少授权信息 (Token)，请重新登录后再试。' });
        }

        if (!token) {
            return res.status(401).json({ message: 'Aucune information d\'autorisation fournie (Token)' });
        }

        // 验证 Token
        const decoded = jwt.verify(token, JWT_SECRET_KEY); 

        // 可选：从数据库中查询用户，确保 Token 对应的用户仍有效
        const user = await User.findByPk(decoded.id); 
        if (!user) {
            return res.status(401).json({ message: 'L\'utilisateur n\'existe pas ou a été supprimé' });
        }

        // 将 user 信息保存到 req 中，供后续处理
        req.user = user;
        next(); 
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ message: 'Jeton invalide, veuillez vous reconnecter' });
    }
};