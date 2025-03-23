import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock du module models
vi.mock('../../../models', () => {
  const ProductMock = {
    findByPk: vi.fn(),
    findAll: vi.fn(),
    findAndCountAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    findOne: vi.fn()
  };
  
  return {
    Product: ProductMock
  };
});

// Mock sequelize
vi.mock('sequelize', () => {
  return {
    Op: {},
    Sequelize: {}
  };
});

// Importez le contrôleur après avoir configuré les mocks
const productController = require('../../../controllers/productController');
const { Product } = require('../../../models');

describe('Product Controller', () => {
  let req, res;

  beforeEach(() => {
    // Réinitialiser tous les mocks
    vi.clearAllMocks();

    // Créer des objets req et res fictifs
    req = {
      params: {},
      query: {},
      body: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  describe('getProductById', () => {
    it('devrait retourner un produit si l\'ID existe', async () => {
      // Configurer les données de test
      const mockProduct = {
        id: 1,
        name: 'Produit Test',
        description: 'Description du produit test',
        price: 10.99,
        brand: 'Marque Test',
        barcode: '123456789'
      };

      // Configurer les mocks
      req.params.id = 1;
      Product.findByPk.mockResolvedValue(mockProduct);

      // Appeler la fonction à tester
      await productController.getProductById(req, res);

      // Vérifications
      expect(Product.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it('devrait retourner une erreur 404 si le produit n\'existe pas', async () => {
      // Configurer les mocks
      req.params.id = 999;
      Product.findByPk.mockResolvedValue(null);

      // Appeler la fonction à tester
      await productController.getProductById(req, res);

      // Vérifications
      expect(Product.findByPk).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('pas été trouvé')
      }));
    });

    it('devrait gérer les erreurs de la base de données', async () => {
      // Configurer les mocks
      req.params.id = 1;
      Product.findByPk.mockRejectedValue(new Error('Erreur de base de données'));

      // Appeler la fonction à tester
      await productController.getProductById(req, res);

      // Vérifications
      expect(Product.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Impossible de charger')
      }));
    });
  });

  describe('getPaginatedProducts', () => {
    it('devrait retourner une liste paginée de produits', async () => {
      // Configurer les données de test
      const mockProducts = {
        count: 2,
        rows: [
          {
            id: 1,
            name: 'Produit 1',
            price: 10.99
          },
          {
            id: 2,
            name: 'Produit 2',
            price: 19.99
          }
        ]
      };

      // Configurer les mocks
      req.query = { page: '1', limit: '10' };
      Product.findAndCountAll.mockResolvedValue(mockProducts);

      // Appeler la fonction à tester
      await productController.getPaginatedProducts(req, res);

      // Vérifications
      expect(Product.findAndCountAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        totalItems: 2,
        products: mockProducts.rows,
        totalPages: 1,
        currentPage: 1
      }));
    });
  });

  describe('createProduct', () => {
    it('devrait créer un nouveau produit avec succès', async () => {
      // Configurer les données de test
      const productData = {
        name: 'Nouveau Produit',
        description: 'Description du nouveau produit',
        price: 15.99,
        brand: 'Marque Test',
        barcode: '987654321'
      };

      const mockCreatedProduct = {
        id: 3,
        ...productData
      };

      // Configurer les mocks
      req.body = productData;
      Product.create.mockResolvedValue(mockCreatedProduct);

      // Appeler la fonction à tester
      await productController.createProduct(req, res);

      // Vérifications
      expect(Product.create).toHaveBeenCalledWith(productData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedProduct);
    });
  });
}); 