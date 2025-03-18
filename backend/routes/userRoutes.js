const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const {updateUser, getAllUsers, getUserById, updateUserByAdmin} = require("../controllers/userController"); // 导入 UserController
const csrf = require('csurf');

// 配置 CSRF 中间件
const csrfProtection = csrf({ cookie: true });

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /api/user/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs (admin uniquement)
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.get('/users', authMiddleware, isAdmin, getAllUsers)

/**
 * @swagger
 * /api/user/user/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par son ID (admin uniquement)
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:id', authMiddleware, isAdmin, getUserById)

/**
 * @swagger
 * /api/user/update_user:
 *   put:
 *     summary: Mettre à jour son propre profil utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Prénom de l'utilisateur
 *               lastName:
 *                 type: string
 *                 description: Nom de l'utilisateur
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur
 *               phone:
 *                 type: string
 *                 description: Numéro de téléphone
 *               address:
 *                 type: string
 *                 description: Adresse
 *               zipCode:
 *                 type: string
 *                 description: Code postal
 *               city:
 *                 type: string
 *                 description: Ville
 *               country:
 *                 type: string
 *                 description: Pays
 *     responses:
 *       200:
 *         description: Profil utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.put('/update_user', authMiddleware, csrfProtection, (req, res, next) => {
    console.log("CSRF Token from headers:", req.headers['x-csrf-token']); // 前端传递的 Token
    console.log("CSRF Token from cookies:", req.cookies._csrf); // 后端 Cookie 存储的 Token
    console.log("Session ID:", req.sessionID); // 当前的 Session 信息
    next();
}, updateUser);

/**
 * @swagger
 * /api/user/updateUserByAdmin/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur par l'administrateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Prénom de l'utilisateur
 *               lastName:
 *                 type: string
 *                 description: Nom de l'utilisateur
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur
 *               phone:
 *                 type: string
 *                 description: Numéro de téléphone
 *               address:
 *                 type: string
 *                 description: Adresse
 *               zipCode:
 *                 type: string
 *                 description: Code postal
 *               city:
 *                 type: string
 *                 description: Ville
 *               country:
 *                 type: string
 *                 description: Pays
 *               role:
 *                 type: string
 *                 enum: [admin, seller, buyer]
 *                 description: Rôle de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/updateUserByAdmin/:id',authMiddleware, isAdmin, updateUserByAdmin)

/**
 * @swagger
 * /api/user/csrf-token:
 *   get:
 *     summary: Obtenir un token CSRF
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Token CSRF généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 *                   description: Token CSRF à utiliser pour les requêtes protégées
 *       500:
 *         description: Erreur serveur
 */
router.get('/csrf-token', csrfProtection, (req, res) => {
    res.status(200).json({ csrfToken: req.csrfToken() });
});

module.exports = router;