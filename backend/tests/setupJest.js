// Configuration pour les tests Jest
require('dotenv').config(); // Charge les variables d'environnement

// Configuration globale pour les tests
global.console.error = jest.fn(); // Mock de console.error
global.console.log = jest.fn(); // Mock de console.log

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
}); 