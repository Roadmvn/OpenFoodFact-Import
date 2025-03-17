const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { logger } = require('../utils/logger');

class User {
    static async create({ email, password, firstname, lastname, role = 'client' }) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await db.query(
                'INSERT INTO users (email, password, firstname, lastname, role) VALUES (?, ?, ?, ?, ?)',
                [email, hashedPassword, firstname, lastname, role]
            );
            return result.insertId;
        } catch (error) {
            logger.error('Error creating user:', error);
            throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
        }
    }

    static async findByEmail(email) {
        try {
            logger.info(`Searching for user with email: ${email}`);
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            logger.info('Found user:', rows[0]);
            return rows[0];
        } catch (error) {
            logger.error('Error finding user:', error);
            throw new Error(`Erreur lors de la recherche de l'utilisateur: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de l'utilisateur: ${error.message}`);
        }
    }

    static async update(id, updates) {
        try {
            if (updates.password) {
                updates.password = await bcrypt.hash(updates.password, 10);
            }
            const fields = Object.keys(updates)
                .map(key => `${key} = ?`)
                .join(', ');
            const values = [...Object.values(updates), id];
            
            await db.query(`UPDATE users SET ${fields} WHERE id = ?`, values);
            return true;
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
        }
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;
