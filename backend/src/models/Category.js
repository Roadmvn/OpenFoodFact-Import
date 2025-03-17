const db = require('../config/database');

class Category {
    static async create({ name, description }) {
        try {
            const [result] = await db.query(
                'INSERT INTO categories (name, description) VALUES (?, ?)',
                [name, description]
            );
            return result.insertId;
        } catch (error) {
            throw new Error(`Erreur lors de la création de la catégorie: ${error.message}`);
        }
    }

    static async findAll() {
        try {
            const [rows] = await db.query('SELECT * FROM categories');
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des catégories: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de la catégorie: ${error.message}`);
        }
    }

    static async update(id, { name, description }) {
        try {
            await db.query(
                'UPDATE categories SET name = ?, description = ? WHERE id = ?',
                [name, description, id]
            );
            return true;
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour de la catégorie: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            await db.query('DELETE FROM categories WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression de la catégorie: ${error.message}`);
        }
    }
}

module.exports = Category;
