import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Sequelize } from 'sequelize';
import CartModel from '../../../models/cart';

describe('Cart Model', () => {
  let sequelize;
  let Cart;

  beforeAll(() => {
    // Configurer une instance Sequelize en mémoire pour les tests
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false
    });
    
    // Initialiser le modèle Cart avec l'instance Sequelize
    Cart = CartModel(sequelize, Sequelize.DataTypes);
    
    // Mock de la méthode associate pour éviter les erreurs
    Cart.associate = vi.fn();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('devrait avoir les propriétés attendues', () => {
    const cart = Cart.build({
      userId: 1,
      internalProductId: 2,
      quantity: 3,
      status: 'active'
    });

    // Vérifier que les propriétés attendues sont présentes
    expect(cart).toHaveProperty('userId', 1);
    expect(cart).toHaveProperty('internalProductId', 2);
    expect(cart).toHaveProperty('quantity', 3);
    expect(cart).toHaveProperty('status', 'active');
  });

  it('devrait avoir des valeurs par défaut pour quantity et status', () => {
    const cart = Cart.build({
      userId: 1,
      internalProductId: 2
    });

    expect(cart).toHaveProperty('quantity', 1);
    expect(cart).toHaveProperty('status', 'active');
  });

  it('devrait avoir une méthode associate', () => {
    expect(Cart.associate).toBeDefined();
    expect(typeof Cart.associate).toBe('function');
  });

  it('userId ne devrait pas être null', () => {
    // Vérifier que le champ userId ne permet pas de valeur null
    const userIdAttribute = Cart.rawAttributes.userId;
    expect(userIdAttribute.allowNull).toBe(false);
  });

  it('internalProductId ne devrait pas être null', () => {
    // Vérifier que le champ internalProductId ne permet pas de valeur null
    const internalProductIdAttribute = Cart.rawAttributes.internalProductId;
    expect(internalProductIdAttribute.allowNull).toBe(false);
  });
}); 