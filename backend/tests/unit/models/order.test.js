import { Order, User, sequelize } from '../../../models';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Order Model', () => {
  // Avant chaque test, synchronisons la base de données
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  // Après chaque test, fermons la connexion
  afterEach(async () => {
    await sequelize.close();
  });

  it('devrait créer une commande avec succès', async () => {
    // D'abord créer un vendeur et un acheteur
    const seller = await User.create({
      firstName: 'Vendeur',
      lastName: 'Test',
      email: 'vendeur@test.com',
      password: 'password123',
      role: 'seller'
    });

    const buyer = await User.create({
      firstName: 'Acheteur',
      lastName: 'Test',
      email: 'acheteur@test.com',
      password: 'password123',
      role: 'buyer'
    });

    // Données de la commande
    const orderData = {
      buyerId: buyer.id,
      sellerId: seller.id,
      totalAmount: 129.99,
      status: 'pending'
    };

    // Création de la commande
    const order = await Order.create(orderData);

    // Assertions
    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(order.buyerId).toBe(buyer.id);
    expect(order.sellerId).toBe(seller.id);
    expect(parseFloat(order.totalAmount)).toBe(orderData.totalAmount);
    expect(order.status).toBe('pending');
    expect(order.paypalPayment).toBe(false);
    expect(order.paypalTransactionId).toBeFalsy();
  });

  it('devrait mettre à jour le statut d\'une commande', async () => {
    // D'abord créer un vendeur et un acheteur
    const seller = await User.create({
      firstName: 'Vendeur',
      lastName: 'Test',
      email: 'vendeur@test.com',
      password: 'password123',
      role: 'seller'
    });

    const buyer = await User.create({
      firstName: 'Acheteur',
      lastName: 'Test',
      email: 'acheteur@test.com',
      password: 'password123',
      role: 'buyer'
    });

    // Créer une commande
    const order = await Order.create({
      buyerId: buyer.id,
      sellerId: seller.id,
      totalAmount: 129.99,
      status: 'pending'
    });

    // Mettre à jour le statut de la commande
    order.status = 'completed';
    await order.save();

    // Récupérer la commande mise à jour
    const updatedOrder = await Order.findByPk(order.id);

    // Assertions
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder.status).toBe('completed');
  });

  it('devrait enregistrer une transaction PayPal', async () => {
    // D'abord créer un vendeur et un acheteur
    const seller = await User.create({
      firstName: 'Vendeur',
      lastName: 'Test',
      email: 'vendeur@test.com',
      password: 'password123',
      role: 'seller'
    });

    const buyer = await User.create({
      firstName: 'Acheteur',
      lastName: 'Test',
      email: 'acheteur@test.com',
      password: 'password123',
      role: 'buyer'
    });

    // Créer une commande
    const order = await Order.create({
      buyerId: buyer.id,
      sellerId: seller.id,
      totalAmount: 129.99,
      status: 'pending'
    });

    // Mettre à jour avec les informations PayPal
    order.paypalPayment = true;
    order.paypalTransactionId = 'PAYPAL-TXN-123456';
    order.status = 'completed';
    await order.save();

    // Récupérer la commande mise à jour
    const updatedOrder = await Order.findByPk(order.id);

    // Assertions
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder.paypalPayment).toBe(true);
    expect(updatedOrder.paypalTransactionId).toBe('PAYPAL-TXN-123456');
    expect(updatedOrder.status).toBe('completed');
  });

  it('ne devrait pas créer une commande sans acheteur', async () => {
    // Créer seulement un vendeur
    const seller = await User.create({
      firstName: 'Vendeur',
      lastName: 'Test',
      email: 'vendeur@test.com',
      password: 'password123',
      role: 'seller'
    });

    // Données de la commande sans acheteur
    const orderData = {
      sellerId: seller.id,
      totalAmount: 129.99,
      status: 'pending'
    };

    try {
      // Tentative de création de la commande
      await Order.create(orderData);
      // Si on arrive ici, le test échoue
      expect(true).toBe(false);
    } catch (error) {
      // On s'attend à une erreur
      expect(error).toBeDefined();
    }
  });
}); 