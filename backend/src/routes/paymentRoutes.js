const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
    createPaymentIntent,
    handleWebhook,
    refundPayment
} = require('../controllers/paymentController');

// Route pour le webhook Stripe (pas d'auth car appelé par Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Routes protégées
router.post('/create-payment-intent', authenticate, createPaymentIntent);
router.post('/refund', authenticate, authorize('admin'), refundPayment);

module.exports = router;
