const express = require('express');
const router = express.Router();
const internalProductController = require('../controllers/internalProductController');
const authMiddleware = require('../middleware/authMiddleware'); // 验证用户是否登录
const isSeller = require('../middleware/isSeller');   // 验证用户是否为管理员

/**
 * @swagger
 * tags:
 *   name: Produits Internes
 *   description: Gestion des produits internes (produits mis en vente par les vendeurs)
 */

/**
 * @swagger
 * /api/internal-products:
 *   post:
 *     summary: Créer un nouveau produit interne
 *     tags: [Produits Internes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - price
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID du produit OpenFoodFact
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Prix du produit
 *               quantity:
 *                 type: integer
 *                 description: Quantité disponible
 *     responses:
 *       201:
 *         description: Produit interne créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalProduct'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
// 创建内部产品
router.post('/', authMiddleware, isSeller, internalProductController.createInternalProduct);

/**
 * @swagger
 * /api/internal-products:
 *   get:
 *     summary: Récupérer les produits internes du vendeur connecté
 *     tags: [Produits Internes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des produits internes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InternalProduct'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
// 获取当前用户的内部产品
router.get('/', authMiddleware, isSeller, internalProductController.getInternalProducts);

/**
 * @swagger
 * /api/internal-products/products_all:
 *   get:
 *     summary: Récupérer tous les produits internes
 *     tags: [Produits Internes]
 *     responses:
 *       200:
 *         description: Liste de tous les produits internes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InternalProduct'
 *       500:
 *         description: Erreur serveur
 */
router.get('/products_all', internalProductController.getAllInternalProducts);

/**
 * @swagger
 * /api/internal-products/products/{id}:
 *   get:
 *     summary: Récupérer un produit interne par son ID
 *     tags: [Produits Internes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit interne
 *     responses:
 *       200:
 *         description: Produit interne récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalProduct'
 *       404:
 *         description: Produit interne non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/products/:id' , internalProductController.getProductById);

/**
 * @swagger
 * /api/internal-products/products_search:
 *   get:
 *     summary: Rechercher des produits internes
 *     tags: [Produits Internes]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *     responses:
 *       200:
 *         description: Résultats de recherche récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InternalProduct'
 *       500:
 *         description: Erreur serveur
 */
router.get('/products_search' , internalProductController.dynamicSearch);

/**
 * @swagger
 * /api/internal-products/{id}:
 *   put:
 *     summary: Mettre à jour un produit interne
 *     tags: [Produits Internes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit interne
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Prix du produit
 *               quantity:
 *                 type: integer
 *                 description: Quantité disponible
 *     responses:
 *       200:
 *         description: Produit interne mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalProduct'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Produit interne non trouvé
 *       500:
 *         description: Erreur serveur
 */
// 更新内部产品
router.put('/:id', authMiddleware, isSeller, internalProductController.updateInternalProduct);

/**
 * @swagger
 * /api/internal-products/{id}:
 *   delete:
 *     summary: Supprimer un produit interne
 *     tags: [Produits Internes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit interne
 *     responses:
 *       200:
 *         description: Produit interne supprimé avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Produit interne non trouvé
 *       500:
 *         description: Erreur serveur
 */
// 删除内部产品
router.delete('/:id', authMiddleware, isSeller, internalProductController.deleteInternalProduct);

module.exports = router;