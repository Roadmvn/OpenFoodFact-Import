const searchService = require('../services/searchService');
const AppError = require('../utils/AppError');

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Recherche avancée de produits
 *     description: Recherche des produits avec filtres, tri et pagination
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: ID de la catégorie
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Prix minimum
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Prix maximum
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Marque du produit
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price, name, created_at]
 *         description: Champ de tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Ordre de tri
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des produits trouvés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       400:
 *         description: Paramètres invalides
 *       500:
 *         description: Erreur serveur
 */
const search = async (req, res, next) => {
    try {
        const results = await searchService.search(req.query);
        res.json(results);
    } catch (error) {
        next(new AppError('Erreur lors de la recherche', 500));
    }
};

/**
 * @swagger
 * /api/search/suggest:
 *   get:
 *     summary: Suggestions de recherche
 *     description: Retourne des suggestions basées sur le terme de recherche
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *     responses:
 *       200:
 *         description: Liste des suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Paramètre de recherche manquant
 *       500:
 *         description: Erreur serveur
 */
const suggest = async (req, res, next) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            throw new AppError('Le terme de recherche doit contenir au moins 2 caractères', 400);
        }

        const suggestions = await searchService.suggest(q);
        res.json(suggestions);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    search,
    suggest
};
