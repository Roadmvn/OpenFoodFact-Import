import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock les modules directement
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn().mockResolvedValue(true)
}));

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('fake_token')
}));

// Créer des mocks pour les modèles
const UserMock = {
  findOne: vi.fn(),
  create: vi.fn(),
  scope: vi.fn().mockReturnThis()
};

vi.mock('../../../models', () => ({
  User: UserMock
}));

// Importer le contrôleur après avoir configuré les mocks
const authController = require('../../../controllers/authController');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();

    // Réinitialiser explicitement les fonctions mockées
    UserMock.findOne.mockReset();
    UserMock.create.mockReset();
    UserMock.scope.mockReturnThis();

    // Créer des objets req et res fictifs
    req = {
      body: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        password: 'MotDePasse123',
        phone: '0123456789',
        address: '123 Rue Principale',
        zipCode: '75000',
        city: 'Paris',
        country: 'France'
      },
      headers: {},
      cookies: {},
      session: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn()
    };
  });

  describe('register', () => {
    it('devrait créer un utilisateur avec succès', async () => {
      // Configuration des mocks
      // L'utilisateur n'existe pas encore
      UserMock.findOne.mockResolvedValueOnce(null);
      
      // Mock de la création d'utilisateur
      UserMock.create.mockResolvedValueOnce({
        id: 1,
        ...req.body,
        password: 'hashed_password'
      });

      // Appel de la fonction à tester
      await authController.register(req, res);

      // Vérifications
      expect(UserMock.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } });
      expect(vi.mocked(require('bcryptjs').hash)).toHaveBeenCalledWith(req.body.password, 10);
      expect(UserMock.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String),
        user: expect.anything()
      }));
    });

    it('ne devrait pas créer un utilisateur si l\'email existe déjà', async () => {
      // Configuration des mocks
      // L'utilisateur existe déjà
      UserMock.findOne.mockResolvedValueOnce({ id: 1, email: req.body.email });

      // Appel de la fonction à tester
      await authController.register(req, res);

      // Vérifications
      expect(UserMock.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } });
      expect(vi.mocked(require('bcryptjs').hash)).not.toHaveBeenCalled();
      expect(UserMock.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('existe déjà')
      }));
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      // Configuration des mocks
      const mockUser = {
        id: 1,
        email: req.body.email,
        password: 'hashed_password',
        role: 'buyer',
        firstName: 'Jean',
        lastName: 'Dupont',
        toJSON: () => ({
          id: 1,
          email: req.body.email,
          role: 'buyer',
          firstName: 'Jean',
          lastName: 'Dupont'
        })
      };

      // L'utilisateur existe
      UserMock.findOne.mockResolvedValueOnce(mockUser);

      // Configurer la requête pour le login
      req.body = {
        email: 'jean.dupont@example.com',
        password: 'MotDePasse123'
      };

      // Appel de la fonction à tester
      await authController.login(req, res);

      // Vérifications
      expect(UserMock.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } });
      expect(vi.mocked(require('bcryptjs').compare)).toHaveBeenCalledWith(req.body.password, mockUser.password);
      expect(vi.mocked(require('jsonwebtoken').sign)).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String),
        user: expect.anything(),
        token: expect.any(String)
      }));
    });

    it('devrait refuser l\'accès avec des identifiants invalides', async () => {
      // Configuration des mocks
      const mockUser = {
        id: 1,
        email: req.body.email,
        password: 'hashed_password'
      };

      // L'utilisateur existe
      UserMock.findOne.mockResolvedValueOnce(mockUser);
      
      // Mot de passe incorrect
      vi.mocked(require('bcryptjs').compare).mockResolvedValueOnce(false);

      // Configurer la requête pour le login
      req.body = {
        email: 'jean.dupont@example.com',
        password: 'MotDePasseIncorrect'
      };

      // Appel de la fonction à tester
      await authController.login(req, res);

      // Vérifications
      expect(UserMock.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } });
      expect(vi.mocked(require('bcryptjs').compare)).toHaveBeenCalledWith(req.body.password, mockUser.password);
      expect(vi.mocked(require('jsonwebtoken').sign)).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('incorrects')
      }));
    });
  });
}); 