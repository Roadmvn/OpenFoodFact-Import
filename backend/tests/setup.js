// Configuration pour les tests Vitest
import { config } from 'dotenv';
import { vi, afterEach, beforeAll, afterAll } from 'vitest';
import { resetDatabase, closeDatabase } from './helpers/setupDatabase';

// Charge les variables d'environnement de test
config({ path: '.env.test' });

// Forcer l'environnement de test
process.env.NODE_ENV = 'test';

// Configuration globale pour les tests
global.console.error = vi.fn(); // Mock de console.error
global.console.log = vi.fn(); // Mock de console.log

// Configuration de la base de données avant tous les tests
beforeAll(async () => {
  try {
    await resetDatabase();
  } catch (error) {
    console.error('Erreur lors de la configuration initiale de la base de données:', error);
  }
});

// Fermeture de la connexion à la base de données après tous les tests
afterAll(async () => {
  try {
    await closeDatabase();
  } catch (error) {
    console.error('Erreur lors de la fermeture de la connexion à la base de données:', error);
  }
});

// Nettoyage après chaque test
afterEach(() => {
  vi.clearAllMocks();
}); 