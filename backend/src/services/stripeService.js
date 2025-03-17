const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');

class StripeService {
    async createPaymentIntent(orderId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                throw new Error('Commande non trouvée');
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(order.total_amount * 100), // Stripe utilise les centimes
                currency: process.env.STRIPE_CURRENCY,
                metadata: {
                    order_id: orderId
                }
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };
        } catch (error) {
            throw new Error(`Erreur lors de la création du paiement: ${error.message}`);
        }
    }

    async handleWebhook(event) {
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSuccess(event.data.object);
                    break;
                    
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailure(event.data.object);
                    break;
            }
        } catch (error) {
            throw new Error(`Erreur lors du traitement du webhook: ${error.message}`);
        }
    }

    async handlePaymentSuccess(paymentIntent) {
        const orderId = paymentIntent.metadata.order_id;
        
        try {
            // Mettre à jour le statut de la commande
            await Order.updateStatus(orderId, 'paid');

            // Créer la facture
            await Invoice.create({
                order_id: orderId,
                payment_id: paymentIntent.id,
                payment_status: 'completed',
                amount: paymentIntent.amount / 100
            });
        } catch (error) {
            throw new Error(`Erreur lors du traitement du paiement réussi: ${error.message}`);
        }
    }

    async handlePaymentFailure(paymentIntent) {
        const orderId = paymentIntent.metadata.order_id;
        
        try {
            // Mettre à jour le statut de la commande
            await Order.updateStatus(orderId, 'pending');

            // Créer ou mettre à jour la facture
            const invoice = await Invoice.findByOrderId(orderId);
            if (invoice) {
                await Invoice.updatePaymentStatus(invoice.id, 'failed');
            } else {
                await Invoice.create({
                    order_id: orderId,
                    payment_id: paymentIntent.id,
                    payment_status: 'failed',
                    amount: paymentIntent.amount / 100
                });
            }
        } catch (error) {
            throw new Error(`Erreur lors du traitement du paiement échoué: ${error.message}`);
        }
    }

    async refundPayment(paymentIntentId, amount = null) {
        try {
            const refundParams = {
                payment_intent: paymentIntentId
            };

            if (amount) {
                refundParams.amount = Math.round(amount * 100);
            }

            const refund = await stripe.refunds.create(refundParams);
            return refund;
        } catch (error) {
            throw new Error(`Erreur lors du remboursement: ${error.message}`);
        }
    }
}

module.exports = new StripeService();
