const Product = require('../models/Product');
const { logger } = require('../utils/logger');
const cacheService = require('./cacheService');

class SearchService {
    constructor() {
        this.searchFields = ['name', 'description', 'brand'];
        this.sortOptions = ['price', 'name', 'created_at'];
    }

    async search(params) {
        try {
            const {
                query,
                category,
                minPrice,
                maxPrice,
                brand,
                sort = 'name',
                order = 'asc',
                page = 1,
                limit = 10
            } = params;

            // Vérifier le cache
            const cacheKey = this.generateCacheKey(params);
            const cachedResults = await cacheService.get(cacheKey);
            if (cachedResults) {
                return cachedResults;
            }

            // Construire la requête SQL
            let sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
            const values = [];

            // Recherche textuelle
            if (query) {
                sql += ` AND (
                    p.name LIKE ? OR
                    p.description LIKE ? OR
                    p.brand LIKE ?
                )`;
                const searchTerm = `%${query}%`;
                values.push(searchTerm, searchTerm, searchTerm);
            }

            // Filtres
            if (category) {
                sql += ' AND p.category_id = ?';
                values.push(category);
            }

            if (minPrice) {
                sql += ' AND p.price >= ?';
                values.push(minPrice);
            }

            if (maxPrice) {
                sql += ' AND p.price <= ?';
                values.push(maxPrice);
            }

            if (brand) {
                sql += ' AND p.brand LIKE ?';
                values.push(`%${brand}%`);
            }

            // Tri
            if (this.sortOptions.includes(sort)) {
                sql += ` ORDER BY p.${sort} ${order === 'desc' ? 'DESC' : 'ASC'}`;
            }

            // Pagination
            const offset = (page - 1) * limit;
            sql += ' LIMIT ? OFFSET ?';
            values.push(parseInt(limit), offset);

            // Exécuter la requête
            const results = await Product.query(sql, values);

            // Obtenir le nombre total pour la pagination
            const [{ total }] = await Product.query(
                'SELECT COUNT(*) as total FROM products p WHERE ' + sql.split('WHERE')[1].split('ORDER BY')[0],
                values.slice(0, -2)
            );

            const response = {
                results,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };

            // Mettre en cache les résultats
            await cacheService.set(cacheKey, response, 300); // Cache pour 5 minutes

            return response;
        } catch (error) {
            logger.error('Erreur dans la recherche:', error);
            throw error;
        }
    }

    async suggest(query) {
        try {
            const sql = `
                SELECT DISTINCT 
                    CASE 
                        WHEN name LIKE ? THEN name
                        WHEN brand LIKE ? THEN brand
                        ELSE NULL
                    END as suggestion
                FROM products
                WHERE name LIKE ? OR brand LIKE ?
                LIMIT 5
            `;
            const searchTerm = `%${query}%`;
            const suggestions = await Product.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm]);
            
            return suggestions.map(s => s.suggestion).filter(Boolean);
        } catch (error) {
            logger.error('Erreur dans les suggestions:', error);
            throw error;
        }
    }

    generateCacheKey(params) {
        return `search:${JSON.stringify(params)}`;
    }
}

module.exports = new SearchService();
