const Order = require('../models/Order');
const Product = require('../models/Product');

const createOrder = async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'La commande doit contenir au moins un article' });
        }

        // Vérifier la validité des produits et leur disponibilité
        for (const item of items) {
            const product = await Product.findById(item.product_id);
            if (!product) {
                return res.status(400).json({ 
                    message: `Le produit ${item.product_id} n'existe pas` 
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Stock insuffisant pour le produit ${product.name}` 
                });
            }
        }

        const orderId = await Order.create(req.user.id, items);
        const order = await Order.findById(orderId);
        
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const orders = await Order.findByUser(req.user.id, { page, limit });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        // Vérifier que l'utilisateur est autorisé à voir cette commande
        if (order.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Statut invalide',
                validStatuses 
            });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        await Order.updateStatus(req.params.id, status);
        const updatedOrder = await Order.findById(req.params.id);
        
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrderStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await Order.getStats(startDate, endDate);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getOrderStats
};
