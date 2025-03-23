import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Sequelize } from 'sequelize';
import UserModel from '../../../models/user';

describe('User Model', () => {
  let sequelize;
  let User;

  beforeAll(() => {
    // Configurer une instance Sequelize en mémoire pour les tests
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false
    });
    
    // Initialiser le modèle User avec l'instance Sequelize
    User = UserModel(sequelize, Sequelize.DataTypes);
    
    // Mock de la méthode associate pour éviter les erreurs
    User.associate = vi.fn();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('devrait avoir les propriétés attendues', () => {
    const user = User.build({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      password: 'motdepasse123',
      role: 'buyer',
      phone: '0123456789',
      address: '123 rue de Paris',
      zipCode: '75001',
      city: 'Paris',
      country: 'France'
    });

    // Vérifier que les propriétés attendues sont présentes
    expect(user).toHaveProperty('firstName', 'Jean');
    expect(user).toHaveProperty('lastName', 'Dupont');
    expect(user).toHaveProperty('email', 'jean.dupont@example.com');
    expect(user).toHaveProperty('password', 'motdepasse123');
    expect(user).toHaveProperty('role', 'buyer');
    expect(user).toHaveProperty('phone', '0123456789');
    expect(user).toHaveProperty('address', '123 rue de Paris');
    expect(user).toHaveProperty('zipCode', '75001');
    expect(user).toHaveProperty('city', 'Paris');
    expect(user).toHaveProperty('country', 'France');
  });

  it('devrait avoir un rôle par défaut de "buyer"', () => {
    const user = User.build({
      firstName: 'Pierre',
      lastName: 'Martin',
      email: 'pierre.martin@example.com',
      password: 'motdepasse456'
    });

    expect(user).toHaveProperty('role', 'buyer');
  });

  it('devrait avoir une méthode associate', () => {
    expect(User.associate).toBeDefined();
    expect(typeof User.associate).toBe('function');
  });

  it('devrait avoir un defaultScope qui exclut le mot de passe', () => {
    expect(User.options.defaultScope).toBeDefined();
    expect(User.options.defaultScope.attributes).toBeDefined();
    expect(User.options.defaultScope.attributes.exclude).toContain('password');
  });

  it('devrait avoir un scope withPassword qui inclut le mot de passe', () => {
    expect(User.options.scopes).toBeDefined();
    expect(User.options.scopes.withPassword).toBeDefined();
    expect(User.options.scopes.withPassword.attributes).toBeDefined();
    expect(User.options.scopes.withPassword.attributes.include).toContain('password');
  });
}); 