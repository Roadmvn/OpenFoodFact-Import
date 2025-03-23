const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// JWT SECRET KEY
const JWT_SECRET_KEY = 'c7fOuEeCk2ijM5aMLue'; // 请将此密钥存储在安全的环境变量中

// 用户注册逻辑
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, address, zipCode, city, country } = req.body;

        // 检查用户是否已存在
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'L\'utilisateur existe déjà！' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            address,
            zipCode,
            city,
            country,
        });

        res.status(201).json({ message: 'Enregistrement de l\'utilisateur réussi！', user });
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        res.status(500).json({ message: 'L\'inscription a échoué！' });
    }
};

// 用户登录逻辑
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 查找用户，使用 withPassword Scope 查找
        const user = await User.scope('withPassword').findOne({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ message: 'L\'utilisateur n\'existe pas！' });
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mot de passe erroné！' });
        }

        // 创建 Session
        req.session.userId = user.id;
        req.session.role = user.role;

        // 签发 JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET_KEY,
            { expiresIn: '2h' }
        );

        // 设置 Cookie（包含 JWT）
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // 生产环境中建议设置为 true（需要 HTTPS）
            maxAge: 2 * 60 * 60 * 1000, // 两小时有效期
        });

        const responseUser = await User.findOne({ where: { email } }); // 默认 Scope 不包含密码

        return res.status(200).json({
            message: 'Connexion réussie',
            user: responseUser,
            token: token
        });
    } catch (error) {
        console.error('Erreur de connexion:', error);
        return res.status(500).json({ message: 'La connexion a échoué！' });
    }
};

// 用户登出逻辑
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la déconnexion！' });
        }
        res.clearCookie('token');
        res.clearCookie('connect.sid'); // 清除 Session Cookie
        res.status(200).json({ message: 'Déconnexion réussie！' });
    });
};

// 验证 JWT 和 Session 中间件
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token; // 从 Cookie 中读取 JWT
    if (!token) {
        return res.status(401).json({ message: 'Non autorisé, token manquant！' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        req.user = decoded; // 将解码后的内容存储在请求对象中
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token non valide！' });
    }
};

// 验证用户是否已登录以访问受保护路由
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Non autorisé！' });
    }
    next();
};

// Google OAuth Strategy 配置
passport.use(
    new GoogleStrategy(
        {
            clientID: '850975209900-4e76gfd8s1cvhpjbdvdllcolptg0kf29.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'http://localhost:3001/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // 用 Google 返回的 email 查询用户
                const email = profile.emails[0].value;
                const googleId = profile.id;

                // Step 1: 检查是否存在用户
                let user = await User.findOne({ where: { email } });

                if (!user) {
                    // 如果用户不存在，注册一个新用户
                    user = await User.create({
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        password: "google_login",
                        phone: null,
                        address: null,
                        zipCode: null,
                        city: null,
                        country: null,
                        email,
                        googleId, // 保存 Google ID
                        role: 'buyer', // 新用户默认为 "buyer"
                    });

                    console.log(user);
                } else if (!user.googleId) {
                    // 如果用户存在，但没有 Google 登录 ID，补充 Google ID
                    user.googleId = googleId;
                    await user.save();
                }

                // 返回用户数据用于登录
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

const googleLogin = (req, res, next) => {
    passport.authenticate('google', { scope: ['profile', 'email']
        , session: false }, async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Google 登录失败' });
        }

        // 生成 JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            'c7fOuEeCk2ijM5aMLue',
            { expiresIn: '2h' }
        );

        // 创建 Session
        req.session.userId = user.id;
        req.session.role = user.role;

        // 保存 JWT 到 Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // 本地开发，生产需要改为 true
            maxAge: 2 * 60 * 60 * 1000, // 两小时
        });

        res.redirect(`http://localhost:3000?token=${token}`);

    })(req, res, next);
};

// 序列化用户（存储到 Session）
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// 反序列化用户（从 Session 获取用户数据）
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});



module.exports = {
    register,
    login,
    logout,
    authenticateJWT,
    isAuthenticated,
    googleLogin
};