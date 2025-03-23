import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { sequelize, User } from '../../models';

// Pour les modules CommonJS, on doit utiliser une approche différente
const app = require('../../app');

describe('Tests d\'intégration pour l\'authentification', () => {
  // Avant tous les tests, synchroniser la base de données
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  // Après tous les tests, fermer la connexion
  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('devrait enregistrer un nouvel utilisateur', async () => {
      const userData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        password: 'MotDePasse123',
        phone: '0123456789',
        address: '123 Rue Principale',
        zipCode: '75000',
        city: 'Paris',
        country: 'France'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userData.email);
    });

    it('ne devrait pas enregistrer un utilisateur avec un email existant', async () => {
      const userData = {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'jean.dupont@example.com', // Email déjà utilisé
        password: 'AutreMotDePasse',
        phone: '9876543210',
        address: '456 Avenue Secondaire',
        zipCode: '69000',
        city: 'Lyon',
        country: 'France'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('existe déjà');
    });
  });

  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const loginData = {
        email: 'jean.dupont@example.com',
        password: 'MotDePasse123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', loginData.email);
    });

    it('ne devrait pas connecter un utilisateur avec un mot de passe incorrect', async () => {
      const loginData = {
        email: 'jean.dupont@example.com',
        password: 'MotDePasseIncorrect'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('incorrect');
    });
  });
}); 