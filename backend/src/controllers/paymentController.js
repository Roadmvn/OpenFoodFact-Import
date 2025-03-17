const stripeService = require('../services/stripeService');
const Order = require('../models/Order');

const createPaymentIntent = async (req, res) => {
    try {
        const { order_id } = req.body;

        const order = await Order.findById(order_id);
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        // Vérifier que l'utilisateur est autorisé à payer cette commande
        if (order.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const paymentIntent = await stripeService.createPaymentIntent(order_id);
        res.json(paymentIntent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        await stripeService.handleWebhook(event);
        res.json({ received: true });
    } catch (error) {
        console.error('Erreur webhook:', error.message);
        res.status(400).json({ message: error.message });
    }
};

const refundPayment = async (req, res) => {
    try {
        const { order_id, amount } = req.body;

        const order = await Order.findById(order_id);
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        const invoice = await Invoice.findByOrderId(order_id);
        if (!invoice || invoice.payment_status !== 'completed') {
            return res.status(400).json({ message: 'Commande non éligible pour un remboursement' });
        }

        const refund = await stripeService.refundPayment(invoice.payment_id, amount);
        
        // Mettre à jour le statut de la commande si remboursement total
        if (!amount || amount === order.total_amount) {
            await Order.updateStatus(order_id, 'refunded');
        }

        res.json(refund);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPaymentIntent,
    handleWebhook,
    refundPayment
};
