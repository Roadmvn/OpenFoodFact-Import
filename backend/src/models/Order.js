const db = require('../config/database');

class Order {
    static async create(userId, items) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Calculer le montant total
            let totalAmount = 0;
            for (const item of items) {
                const [productRows] = await connection.query(
                    'SELECT price, stock FROM products WHERE id = ?',
                    [item.product_id]
                );
                
                if (!productRows[0]) {
                    throw new Error(`Produit ${item.product_id} non trouvé`);
                }
                
                if (productRows[0].stock < item.quantity) {
                    throw new Error(`Stock insuffisant pour le produit ${item.product_id}`);
                }
                
                totalAmount += productRows[0].price * item.quantity;
            }

            // Créer la commande
            const [orderResult] = await connection.query(
                'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
                [userId, totalAmount, 'pending']
            );
            const orderId = orderResult.insertId;

            // Ajouter les articles de la commande
            for (const item of items) {
                const [productRows] = await connection.query(
                    'SELECT price FROM products WHERE id = ?',
                    [item.product_id]
                );
                
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, productRows[0].price]
                );

                // Mettre à jour le stock
                await connection.query(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            await connection.commit();
            return orderId;
        } catch (error) {
            await connection.rollback();
            throw new Error(`Erreur lors de la création de la commande: ${error.message}`);
        } finally {
            connection.release();
        }
    }

    static async findById(id) {
        try {
            const [orderRows] = await db.query(
                `SELECT o.*, u.email, u.firstname, u.lastname 
                FROM orders o 
                JOIN users u ON o.user_id = u.id 
                WHERE o.id = ?`,
                [id]
            );

            if (!orderRows[0]) return null;

            const [itemRows] = await db.query(
                `SELECT oi.*, p.name, p.brand 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?`,
                [id]
            );

            return {
                ...orderRows[0],
                items: itemRows
            };
        } catch (error) {
            throw new Error(`Erreur lors de la recherche de la commande: ${error.message}`);
        }
    }

    static async findByUser(userId, { page = 1, limit = 10 }) {
        try {
            const offset = (page - 1) * limit;
            const [rows] = await db.query(
                'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [userId, limit, offset]
            );

            const [countResult] = await db.query(
                'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
                [userId]
            );

            return {
                orders: rows,
                total: countResult[0].total,
                page,
                totalPages: Math.ceil(countResult[0].total / limit)
            };
        } catch (error) {
            throw new Error(`Erreur lors de la recherche des commandes: ${error.message}`);
        }
    }

    static async updateStatus(id, status) {
        try {
            await db.query(
                'UPDATE orders SET status = ? WHERE id = ?',
                [status, id]
            );
            return true;
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
        }
    }

    static async getStats(startDate, endDate) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(total_amount) as total_revenue,
                    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
                    AVG(total_amount) as average_order_value,
                    (
                        SELECT COUNT(DISTINCT user_id)
                        FROM orders
                        WHERE created_at BETWEEN ? AND ?
                    ) as unique_customers
                FROM orders
                WHERE created_at BETWEEN ? AND ?
            `;

            const [rows] = await db.query(query, [
                startDate, endDate, startDate, endDate
            ]);

            // Obtenir les produits les plus vendus
            const [topProducts] = await db.query(`
                SELECT 
                    p.id,
                    p.name,
                    p.brand,
                    SUM(oi.quantity) as total_quantity,
                    SUM(oi.quantity * oi.price_at_time) as total_revenue
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.created_at BETWEEN ? AND ?
                GROUP BY p.id, p.name
                ORDER BY total_quantity DESC
                LIMIT 5
            `, [startDate, endDate]);

            return {
                ...rows[0],
                top_products: topProducts
            };
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
        }
    }
}

module.exports = Order;
