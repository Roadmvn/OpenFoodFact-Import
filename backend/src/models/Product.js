const db = require('../config/database');

class Product {
    static async create(productData) {
        try {
            const fields = Object.keys(productData).join(', ');
            const placeholders = Object.keys(productData).map(() => '?').join(', ');
            const values = Object.values(productData);

            const [result] = await db.query(
                `INSERT INTO products (${fields}) VALUES (${placeholders})`,
                values
            );
            return result.insertId;
        } catch (error) {
            throw new Error(`Erreur lors de la création du produit: ${error.message}`);
        }
    }

    static async findAll({ page = 1, limit = 10, category_id = null }) {
        try {
            let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
            const values = [];

            if (category_id) {
                query += ' WHERE p.category_id = ?';
                values.push(category_id);
            }

            query += ' LIMIT ? OFFSET ?';
            values.push(limit, (page - 1) * limit);

            const [rows] = await db.query(query, values);
            const [countResult] = await db.query('SELECT COUNT(*) as total FROM products');
            
            return {
                products: rows,
                total: countResult[0].total,
                page,
                totalPages: Math.ceil(countResult[0].total / limit)
            };
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des produits: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query(
                'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw new Error(`Erreur lors de la recherche du produit: ${error.message}`);
        }
    }

    static async findByBarcode(barcode) {
        try {
            const [rows] = await db.query('SELECT * FROM products WHERE barcode = ?', [barcode]);
            return rows[0];
        } catch (error) {
            throw new Error(`Erreur lors de la recherche du produit par code-barres: ${error.message}`);
        }
    }

    static async update(id, updates) {
        try {
            const fields = Object.keys(updates)
                .map(key => `${key} = ?`)
                .join(', ');
            const values = [...Object.values(updates), id];
            
            await db.query(`UPDATE products SET ${fields} WHERE id = ?`, values);
            return true;
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du produit: ${error.message}`);
        }
    }

    static async updateStock(id, quantity) {
        try {
            await db.query(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [quantity, id]
            );
            return true;
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du stock: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            await db.query('DELETE FROM products WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression du produit: ${error.message}`);
        }
    }

    static async deleteById(id) {
        try {
            const [result] = await db.query(
                'DELETE FROM products WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression du produit: ${error.message}`);
        }
    }

    static async search(query) {
        try {
            const searchTerm = `%${query}%`;
            const [rows] = await db.query(
                'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.name LIKE ? OR p.brand LIKE ? OR p.barcode LIKE ?',
                [searchTerm, searchTerm, searchTerm]
            );
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de produits: ${error.message}`);
        }
    }
}

module.exports = Product;
