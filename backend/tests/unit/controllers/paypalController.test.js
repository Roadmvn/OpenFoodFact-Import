import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Order, Invoice } from '../../../models';
import paypal from '@paypal/checkout-server-sdk';

// Mock des modèles
const OrderMock = {
  findOne: vi.fn(),
  save: vi.fn()
};

const InvoiceMock = {
  create: vi.fn()
};

// Mock des modules externes
vi.mock('@paypal/checkout-server-sdk', () => ({
  orders: {
    OrdersCreateRequest: vi.fn().mockImplementation(() => ({
      prefer: vi.fn().mockReturnThis(),
      requestBody: {}
    })),
    OrdersCaptureRequest: vi.fn().mockImplementation(() => ({
      requestBody: {}
    }))
  }
}));

vi.mock('../../../models', () => ({
  Order: OrderMock,
  Invoice: InvoiceMock
}));

// Mock du client PayPal
const mockExecute = vi.fn();
vi.mock('../../../paypalClient', () => ({
  client: vi.fn(() => ({
    execute: mockExecute
  }))
}));

// Import du contrôleur après les mocks
const paypalController = require('../../../controllers/paypalController');

describe('PayPal Controller', () => {
  let req, res;

  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();

    // Créer des objets req et res fictifs
    req = {
      body: {
        localOrderId: 1
      },
      params: {
        paypalOrderId: 'PAYPAL-ORDER-123'
      }
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    // Mock par défaut pour Order.findOne
    const mockOrderInstance = {
      id: 1,
      totalAmount: 199.99,
      status: 'pending',
      paypalTransactionId: null,
      paypalPayment: false,
      save: vi.fn().mockResolvedValue(true)
    };
    OrderMock.findOne.mockResolvedValue(mockOrderInstance);

    // Mock de la réponse de PayPal
    mockExecute.mockResolvedValue({
      result: {
        id: 'PAYPAL-ORDER-123',
        status: 'CREATED'
      }
    });
  });

  describe('createOrder', () => {
    it('devrait créer une commande PayPal avec succès', async () => {
      // Appel de la fonction à tester
      await paypalController.createOrder(req, res);

      // Vérifications
      expect(OrderMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockExecute).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        paypalTransactionId: 'PAYPAL-ORDER-123',
        status: 'CREATED'
      });
    });

    it('devrait renvoyer une erreur si l\'ID de commande local n\'est pas fourni', async () => {
      // Modification de la requête pour simuler l'absence d'ID
      req.body.localOrderId = null;

      // Appel de la fonction à tester
      await paypalController.createOrder(req, res);

      // Vérifications
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('requis')
      }));
    });

    it('devrait renvoyer une erreur si la commande n\'est pas trouvée', async () => {
      // Mock pour simuler une commande non trouvée
      OrderMock.findOne.mockResolvedValue(null);

      // Appel de la fonction à tester
      await paypalController.createOrder(req, res);

      // Vérifications
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('non trouvée')
      }));
    });
  });

  describe('captureOrder', () => {
    beforeEach(() => {
      // Mock pour les tests de capture
      const orderMock = {
        id: 1,
        totalAmount: 199.99,
        status: 'pending',
        paypalTransactionId: 'PAYPAL-ORDER-123',
        paypalPayment: false,
        save: vi.fn().mockResolvedValue(true)
      };

      OrderMock.findOne.mockResolvedValue(orderMock);
      
      // Mock de la réponse de PayPal pour captureOrder
      const mockCaptureResponse = {
        result: {
          id: 'CAPTURE-123',
          status: 'COMPLETED'
        }
      };
      
      mockExecute.mockResolvedValue(mockCaptureResponse);
      
      // Mock pour la création de facture
      InvoiceMock.create.mockResolvedValue({
        id: 1,
        orderId: 1,
        invoiceNumber: 'INV-123456',
        totalAmount: 199.99,
        status: 'paid'
      });
    });

    it('devrait capturer une commande PayPal avec succès et créer une facture', async () => {
      // Appel de la fonction à tester
      await paypalController.captureOrder(req, res);

      // Vérifications
      expect(mockExecute).toHaveBeenCalled();
      expect(OrderMock.findOne).toHaveBeenCalledWith({ where: { paypalTransactionId: 'PAYPAL-ORDER-123' } });
      expect(InvoiceMock.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        message: expect.stringContaining('succès'),
        captureId: 'CAPTURE-123',
        invoice: expect.anything()
      }));
    });

    it('devrait renvoyer une erreur si l\'ID de commande PayPal n\'est pas fourni', async () => {
      // Modification de la requête pour simuler l'absence d'ID
      req.params.paypalOrderId = null;

      // Appel de la fonction à tester
      await paypalController.captureOrder(req, res);

      // Vérifications
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });

    it('devrait renvoyer une erreur si la commande associée n\'est pas trouvée', async () => {
      // Mock pour simuler une commande non trouvée
      OrderMock.findOne.mockResolvedValue(null);

      // Appel de la fonction à tester
      await paypalController.captureOrder(req, res);

      // Vérifications
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('n\'existe pas')
      }));
    });
  });
}); 