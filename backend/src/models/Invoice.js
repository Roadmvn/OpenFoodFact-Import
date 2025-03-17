const db = require('../config/database');

class Invoice {
    static async create(orderData) {
        try {
            const [result] = await db.query(
                'INSERT INTO invoices (order_id, payment_id, payment_status, amount) VALUES (?, ?, ?, ?)',
                [orderData.order_id, orderData.payment_id, orderData.payment_status, orderData.amount]
            );
            return result.insertId;
        } catch (error) {
            throw new Error(`Erreur lors de la création de la facture: ${error.message}`);
        }
    }

    static async findByOrderId(orderId) {
        try {
            const [rows] = await db.query(
                `SELECT i.*, o.status as order_status, o.created_at as order_date
                FROM invoices i
                JOIN orders o ON i.order_id = o.id
                WHERE i.order_id = ?`,
                [orderId]
            );
            return rows[0];
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de la facture: ${error.message}`);
        }
    }

    static async updatePaymentStatus(id, status, paymentId = null) {
        try {
            let query = 'UPDATE invoices SET payment_status = ?';
            const values = [status];

            if (paymentId) {
                query += ', payment_id = ?';
                values.push(paymentId);
            }

            query += ' WHERE id = ?';
            values.push(id);

            await db.query(query, values);
            return true;
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du statut de paiement: ${error.message}`);
        }
    }

    static async getMonthlyReport(year, month) {
        try {
            const [rows] = await db.query(
                `SELECT 
                    DATE_FORMAT(i.created_at, '%Y-%m-%d') as date,
                    COUNT(*) as total_invoices,
                    SUM(i.amount) as total_amount,
                    COUNT(CASE WHEN i.payment_status = 'completed' THEN 1 END) as paid_invoices,
                    SUM(CASE WHEN i.payment_status = 'completed' THEN i.amount ELSE 0 END) as paid_amount
                FROM invoices i
                WHERE YEAR(i.created_at) = ? AND MONTH(i.created_at) = ?
                GROUP BY DATE_FORMAT(i.created_at, '%Y-%m-%d')
                ORDER BY date`,
                [year, month]
            );
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la génération du rapport mensuel: ${error.message}`);
        }
    }
}

module.exports = Invoice;
