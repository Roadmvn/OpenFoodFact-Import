const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const passport = require('passport');
const { googleLogin } = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: Gestion de l'authentification des utilisateurs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: L'utilisateur existe déjà
 *       500:
 *         description: Erreur serveur
 */
// 注册用户
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe de l'utilisateur
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Mot de passe erroné
 *       404:
 *         description: L'utilisateur n'existe pas
 *       500:
 *         description: Erreur serveur
 */
// 登录用户
router.post('/login', login);

/**
 * @swagger
 * /auth/protected:
 *   get:
 *     summary: Route protégée nécessitant une authentification
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accès autorisé
 *       401:
 *         description: Non autorisé
 */
// 验证登录保护的路由
router.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ message: `Bienvenue, ${req.user.email}！` });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
 */
// 获取当前登录用户的信息
router.get('/me', authMiddleware, userController.getCurrentUser);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnexion de l'utilisateur
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       500:
 *         description: Erreur lors de la déconnexion
 */
// 登出用户
router.post('/logout', logout);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Authentification via Google
 *     tags: [Authentification]
 *     responses:
 *       302:
 *         description: Redirection vers Google
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback après authentification Google
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Authentification réussie
 *       401:
 *         description: Authentification échouée
 */
// Google 登录回调 URL
router.get('/google/callback', googleLogin);

module.exports = router;