const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getOrderStats
} = require('../controllers/orderController');

// Routes pour les clients authentifiés
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);

// Routes pour les administrateurs
router.patch('/:id/status', authenticate, authorize('admin'), updateOrderStatus);
router.get('/stats/overview', authenticate, authorize('admin'), getOrderStats);

module.exports = router;
