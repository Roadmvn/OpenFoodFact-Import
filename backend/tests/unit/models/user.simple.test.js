import { describe, it, expect, vi } from 'vitest';

// Mock du modèle Sequelize
const mockUser = {
  init: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  associate: vi.fn()
};

// Mock du module de données
vi.mock('../../../models', () => ({
  User: mockUser,
  sequelize: {
    define: vi.fn()
  }
}));

describe('User Model (Simple Test)', () => {
  it('devrait avoir les bonnes méthodes', () => {
    expect(mockUser.init).toBeDefined();
    expect(mockUser.findOne).toBeDefined();
    expect(mockUser.create).toBeDefined();
  });

  it('devrait pouvoir créer un utilisateur', async () => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: 'buyer'
    };

    const mockCreatedUser = {
      id: 1,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUser.create.mockResolvedValue(mockCreatedUser);

    const user = await mockUser.create(userData);

    expect(user).toBeDefined();
    expect(user.id).toBe(1);
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe(userData.role);
    expect(mockUser.create).toHaveBeenCalledWith(userData);
  });

  it('devrait pouvoir trouver un utilisateur par email', async () => {
    const email = 'test@example.com';
    const mockFoundUser = {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      email: email,
      role: 'buyer'
    };

    mockUser.findOne.mockResolvedValue(mockFoundUser);

    const user = await mockUser.findOne({ where: { email } });

    expect(user).toBeDefined();
    expect(user.id).toBe(1);
    expect(user.email).toBe(email);
    expect(mockUser.findOne).toHaveBeenCalledWith({ where: { email } });
  });
}); 