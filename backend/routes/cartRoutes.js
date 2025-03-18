const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware'); // 验证用户是否登录

/**
 * @swagger
 * tags:
 *   name: Panier
 *   description: Gestion du panier d'achat
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Récupérer le panier de l'utilisateur connecté
 *     tags: [Panier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Panier récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID du panier
 *                 userId:
 *                   type: integer
 *                   description: ID de l'utilisateur
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de l'élément du panier
 *                       quantity:
 *                         type: integer
 *                         description: Quantité
 *                       price:
 *                         type: number
 *                         format: float
 *                         description: Prix unitaire
 *                       internalProductId:
 *                         type: integer
 *                         description: ID du produit interne
 *                       internalProduct:
 *                         type: object
 *                         description: Détails du produit interne
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
// 获取购物车
router.get('/', authMiddleware, cartController.getCart);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Ajouter un produit au panier
 *     tags: [Panier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - internalProductId
 *               - quantity
 *             properties:
 *               internalProductId:
 *                 type: integer
 *                 description: ID du produit interne
 *               quantity:
 *                 type: integer
 *                 description: Quantité à ajouter
 *     responses:
 *       200:
 *         description: Produit ajouté au panier avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message de confirmation
 *                 cart:
 *                   type: object
 *                   description: Panier mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur serveur
 */
// 添加产品到购物车
router.post('/', authMiddleware, cartController.addToCart);

/**
 * @swagger
 * /api/cart/{id}:
 *   put:
 *     summary: Mettre à jour la quantité d'un produit dans le panier
 *     tags: [Panier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élément du panier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Nouvelle quantité
 *     responses:
 *       200:
 *         description: Quantité mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message de confirmation
 *                 cart:
 *                   type: object
 *                   description: Panier mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Élément du panier non trouvé
 *       500:
 *         description: Erreur serveur
 */
// 更新购物车产品数量
router.put('/:id', authMiddleware, cartController.updateCartItem);

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: Supprimer un produit du panier
 *     tags: [Panier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'élément du panier
 *     responses:
 *       200:
 *         description: Produit supprimé du panier avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message de confirmation
 *                 cart:
 *                   type: object
 *                   description: Panier mis à jour
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Élément du panier non trouvé
 *       500:
 *         description: Erreur serveur
 */
// 删除购物车中的某个产品
router.delete('/:id', authMiddleware, cartController.deleteCartItem);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Vider le panier
 *     tags: [Panier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Panier vidé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message de confirmation
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
// 清空购物车
router.delete('/', authMiddleware, cartController.clearCart);

module.exports = router;