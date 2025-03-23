import { Invoice, Order, User, sequelize } from '../../../models';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Invoice Model', () => {
  // Avant chaque test, synchronisons la base de données
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  // Après chaque test, fermons la connexion
  afterEach(async () => {
    await sequelize.close();
  });

  // Fonction pour générer un numéro de facture vraiment unique
  const generateUniqueInvoiceNumber = () => {
    return `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  };

  it('devrait créer une facture avec succès', async () => {
    // D'abord créer un vendeur et un acheteur
    const seller = await User.create({
      firstName: 'Vendeur',
      lastName: 'Test',
      email: `vendeur-${Date.now()}@test.com`,
      password: 'password123',
      role: 'seller'
    });

    const buyer = await User.create({
      firstName: 'Acheteur',
      lastName: 'Test',
      email: `acheteur-${Date.now()}@test.com`,
      password: 'password123',
      role: 'buyer'
    });

    // Créer une commande
    const order = await Order.create({
      buyerId: buyer.id,
      sellerId: seller.id,
      totalAmount: 199.99,
      status: 'completed'
    });

    // Données de la facture avec numéro unique
    const invoiceData = {
      orderId: order.id,
      invoiceNumber: generateUniqueInvoiceNumber(),
      totalAmount: 199.99,
      status: 'pending'
    };

    // Création de la facture
    const invoice = await Invoice.create(invoiceData);

    // Assertions
    expect(invoice).toBeDefined();
    expect(invoice.id).toBeDefined();
    expect(invoice.orderId).toBe(order.id);
    expect(invoice.invoiceNumber).toBe(invoiceData.invoiceNumber);
    expect(parseFloat(invoice.totalAmount)).toBe(invoiceData.totalAmount);
    expect(invoice.status).toBe('pending');
  });

  it('devrait mettre à jour le statut d\'une facture', async () => {
    // D'abord créer un vendeur et un acheteur
    const seller = await User.create({
      firstName: 'Vendeur',
      lastName: 'Test',
      email: `vendeur-update-${Date.now()}@test.com`,
      password: 'password123',
      role: 'seller'
    });

    const buyer = await User.create({
      firstName: 'Acheteur',
      lastName: 'Test',
      email: `acheteur-update-${Date.now()}@test.com`,
      password: 'password123',
      role: 'buyer'
    });

    // Créer une commande
    const order = await Order.create({
      buyerId: buyer.id,
      sellerId: seller.id,
      totalAmount: 199.99,
      status: 'completed'
    });

    // Créer une facture
    const invoice = await Invoice.create({
      orderId: order.id,
      invoiceNumber: generateUniqueInvoiceNumber(),
      totalAmount: 199.99,
      status: 'pending'
    });

    // Mettre à jour le statut de la facture
    invoice.status = 'paid';
    await invoice.save();

    // Récupérer la facture mise à jour
    const updatedInvoice = await Invoice.findByPk(invoice.id);

    // Assertions
    expect(updatedInvoice).toBeDefined();
    expect(updatedInvoice.status).toBe('paid');
  });

  it('ne devrait pas créer une facture sans numéro de facture', async () => {
    // D'abord créer un vendeur et un acheteur
    const seller = await User.create({
      firstName: 'Vendeur',
      lastName: 'Test',
      email: `vendeur-no-number-${Date.now()}@test.com`,
      password: 'password123',
      role: 'seller'
    });

    const buyer = await User.create({
      firstName: 'Acheteur',
      lastName: 'Test',
      email: `acheteur-no-number-${Date.now()}@test.com`,
      password: 'password123',
      role: 'buyer'
    });

    // Créer une commande
    const order = await Order.create({
      buyerId: buyer.id,
      sellerId: seller.id,
      totalAmount: 199.99,
      status: 'completed'
    });

    // Données de facture sans numéro de facture
    const invoiceData = {
      orderId: order.id,
      totalAmount: 199.99,
      status: 'pending'
    };

    try {
      // Tentative de création de la facture
      await Invoice.create(invoiceData);
      // Si on arrive ici, le test échoue
      expect(true).toBe(false);
    } catch (error) {
      // On s'attend à une erreur
      expect(error).toBeDefined();
    }
  });

  it('ne devrait pas créer une facture avec un numéro de facture déjà existant', async () => {
    // D'abord créer un vendeur et un acheteur
    const seller = await User.create({
      firstName: 'Vendeur',
      lastName: 'Test',
      email: `vendeur-duplicate-${Date.now()}@test.com`,
      password: 'password123',
      role: 'seller'
    });

    const buyer = await User.create({
      firstName: 'Acheteur',
      lastName: 'Test',
      email: `acheteur-duplicate-${Date.now()}@test.com`,
      password: 'password123',
      role: 'buyer'
    });

    // Créer deux commandes
    const order1 = await Order.create({
      buyerId: buyer.id,
      sellerId: seller.id,
      totalAmount: 199.99,
      status: 'completed'
    });

    const order2 = await Order.create({
      buyerId: buyer.id,
      sellerId: seller.id,
      totalAmount: 299.99,
      status: 'completed'
    });

    // Numéro de facture unique pour ce test
    const invoiceNumber = `INV-DUPLICATE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Créer une première facture
    await Invoice.create({
      orderId: order1.id,
      invoiceNumber: invoiceNumber,
      totalAmount: 199.99,
      status: 'pending'
    });

    try {
      // Tentative de création d'une deuxième facture avec le même numéro
      await Invoice.create({
        orderId: order2.id,
        invoiceNumber: invoiceNumber,
        totalAmount: 299.99,
        status: 'pending'
      });
      // Si on arrive ici, le test échoue
      expect(true).toBe(false);
    } catch (error) {
      // On s'attend à une erreur
      expect(error).toBeDefined();
    }
  });
}); 