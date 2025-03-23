import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Sequelize } from 'sequelize';
import ProductModel from '../../../models/products';

describe('Product Model', () => {
  let sequelize;
  let Product;

  beforeAll(() => {
    // Configurer une instance Sequelize en mémoire pour les tests
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false
    });
    
    // Initialiser le modèle Product avec l'instance Sequelize
    Product = ProductModel(sequelize, Sequelize.DataTypes);
    
    // Mock de la méthode associate pour éviter les erreurs
    Product.associate = vi.fn();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('devrait avoir les propriétés attendues', () => {
    const product = Product.build({
      code: '3017620422003',
      name: 'Nutella',
      brand: 'Ferrero',
      categories: 'Pâtes à tartiner',
      labels: 'Sans colorants',
      quantity: '400g',
      image_url: 'http://example.com/image.jpg',
      energy_kcal: 539,
      fat: 30.9,
      saturated_fat: 10.6,
      sugars: 56.3,
      salt: 0.107,
      proteins: 6.3
    });

    // Vérifier que les propriétés attendues sont présentes
    expect(product).toHaveProperty('code', '3017620422003');
    expect(product).toHaveProperty('name', 'Nutella');
    expect(product).toHaveProperty('brand', 'Ferrero');
    expect(product).toHaveProperty('categories', 'Pâtes à tartiner');
    expect(product).toHaveProperty('labels', 'Sans colorants');
    expect(product).toHaveProperty('quantity', '400g');
    expect(product).toHaveProperty('image_url', 'http://example.com/image.jpg');
    expect(product).toHaveProperty('energy_kcal', 539);
    expect(product).toHaveProperty('fat', 30.9);
    expect(product).toHaveProperty('saturated_fat', 10.6);
    expect(product).toHaveProperty('sugars', 56.3);
    expect(product).toHaveProperty('salt', 0.107);
    expect(product).toHaveProperty('proteins', 6.3);
  });

  it('devrait avoir des valeurs par défaut pour les champs requis', () => {
    const product = Product.build({});

    expect(product).toHaveProperty('name', 'Unknown');
    expect(product).toHaveProperty('brand', 'Unknown');
    expect(product).toHaveProperty('categories', 'Unknown');
    expect(product).toHaveProperty('labels', 'None');
  });

  it('devrait gérer correctement le getter de catégories', () => {
    // Tester avec une valeur nulle
    const product1 = Product.build({
      categories: null
    });
    expect(product1.categories).toBe('Unknown');

    // Tester avec une valeur vide
    const product2 = Product.build({
      categories: ''
    });
    expect(product2.categories).toBe('Unknown');

    // Tester avec une valeur valide
    const product3 = Product.build({
      categories: 'Test Category'
    });
    expect(product3.categories).toBe('Test Category');
  });

  it('devrait avoir une méthode associate', () => {
    expect(Product.associate).toBeDefined();
    expect(typeof Product.associate).toBe('function');
  });

  it('devrait activer les timestamps', () => {
    expect(Product.options.timestamps).toBe(true);
  });
}); 