import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock des dépendances
const mockOrderFindOne = vi.fn();
const mockOrderSave = vi.fn();
const mockInvoiceCreate = vi.fn();
const mockExecute = vi.fn();

// Mock des modules utilisés par le contrôleur
vi.mock('../../../models', () => ({
  Order: {
    findOne: mockOrderFindOne
  },
  Invoice: {
    create: mockInvoiceCreate
  }
}));

vi.mock('../../../paypalClient', () => ({
  client: () => ({
    execute: mockExecute
  })
}));

vi.mock('@paypal/checkout-server-sdk', () => ({
  orders: {
    OrdersCreateRequest: vi.fn().mockImplementation(() => ({
      prefer: vi.fn().mockReturnThis(),
      requestBody: vi.fn().mockReturnThis()
    })),
    OrdersCaptureRequest: vi.fn().mockImplementation(() => ({
      requestBody: vi.fn().mockReturnThis()
    }))
  }
}));

// Import du contrôleur (après les mocks)
const paypalController = require('../../../controllers/paypalController');

describe('PayPal Controller (Simple Test)', () => {
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

    // Mock par défaut pour le modèle Order
    mockOrderFindOne.mockResolvedValue({
      id: 1,
      totalAmount: 199.99,
      status: 'pending',
      paypalTransactionId: null,
      paypalPayment: false,
      save: mockOrderSave.mockResolvedValue(true)
    });

    // Mock par défaut pour la réponse PayPal
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
      expect(mockOrderFindOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockExecute).toHaveBeenCalled();
      expect(mockOrderSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        paypalTransactionId: 'PAYPAL-ORDER-123',
        status: 'CREATED'
      });
    });

    it('devrait renvoyer une erreur si l\'ID de commande local n\'est pas fourni', async () => {
      // Modification de la requête
      req.body.localOrderId = null;

      // Appel de la fonction à tester
      await paypalController.createOrder(req, res);

      // Vérifications
      expect(mockOrderFindOne).not.toHaveBeenCalled();
      expect(mockExecute).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('requis')
      }));
    });

    it('devrait renvoyer une erreur si la commande n\'est pas trouvée', async () => {
      // Modifier le mock pour simuler une commande non trouvée
      mockOrderFindOne.mockResolvedValue(null);

      // Appel de la fonction à tester
      await paypalController.createOrder(req, res);

      // Vérifications
      expect(mockOrderFindOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockExecute).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('non trouvée')
      }));
    });
  });

  describe('captureOrder', () => {
    beforeEach(() => {
      // Configurer le mock pour captureOrder
      mockOrderFindOne.mockResolvedValue({
        id: 1,
        totalAmount: 199.99,
        status: 'pending',
        paypalTransactionId: 'PAYPAL-ORDER-123',
        paypalPayment: false,
        save: mockOrderSave.mockResolvedValue(true)
      });

      mockExecute.mockResolvedValue({
        result: {
          id: 'CAPTURE-123',
          status: 'COMPLETED'
        }
      });

      mockInvoiceCreate.mockResolvedValue({
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
      expect(mockOrderFindOne).toHaveBeenCalledWith({ where: { paypalTransactionId: 'PAYPAL-ORDER-123' } });
      expect(mockExecute).toHaveBeenCalled();
      expect(mockOrderSave).toHaveBeenCalled();
      expect(mockInvoiceCreate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        captureId: 'CAPTURE-123'
      }));
    });
  });
}); 