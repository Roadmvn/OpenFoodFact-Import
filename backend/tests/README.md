# Guide des Tests

## Configuration

### Environnement de test
Les tests utilisent une base de données dédiée pour éviter d'affecter les données de développement ou de production. Les configurations sont définies dans le fichier `.env` du projet.

1. Vérifiez que les variables d'environnement de test sont correctement configurées dans `.env`:
```
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=trinity_test
DB_HOST=127.0.0.1
DB_DIALECT=mysql
NODE_ENV=test
JWT_SECRET_KEY=test_secret_key_for_testing
```

### Structure des tests
```
tests/
├── helpers/           # Utilitaires pour les tests
│   └── setupDatabase.js  # Configuration de la base de données
├── unit/              # Tests unitaires
│   ├── models/        # Tests des modèles
│   ├── controllers/   # Tests des contrôleurs
│   └── utils/         # Tests des utilitaires
├── integration/       # Tests d'intégration
├── setup.js           # Configuration globale des tests
└── setupJest.js       # Ancienne configuration Jest (maintenant migré vers Vitest)
```

## Exécution des tests

### Prérequis
Avant d'exécuter les tests, assurez-vous d'avoir installé toutes les dépendances nécessaires :

```bash
# Installation des dépendances du projet
npm install

# Installation de la dépendance nécessaire pour le coverage
npm install @vitest/coverage-v8 --save-dev
```

### Commandes disponibles

```bash
# Exécuter tous les tests unitaires
npm run test:unit

# Exécuter tous les tests avec base de données
npm run test:with-db

# Exécuter seulement les tests de modèles
npm run test:models

# Exécuter seulement les tests de modèles avec base de données
npm run test:models:db

# Exécuter seulement les tests de contrôleurs
npm run test:controllers

# Exécuter seulement les tests d'intégration
npm run test:integration

# Exécuter seulement les tests d'intégration avec base de données
npm run test:integration:db

# Exécuter les tests avec interface utilisateur
npm run test:ui

# Exécuter les tests avec couverture de code
npm run test:coverage
```

### Configurer la base de données de test manuellement
Si vous avez besoin de configurer uniquement la base de données:
```bash
npm run setup:testdb
```

## État actuel des tests

À la dernière exécution, les tests ont donné les résultats suivants :

- **Tests unitaires** : 
  - 14 fichiers de test exécutés
  - 7 fichiers réussis, 7 fichiers échoués
  - 38 tests individuels passés, 7 tests échoués

- **Problèmes principaux** :
  1. Erreurs de référence de tables dans la base de données de test
  2. Problèmes de mocks dans certains tests de contrôleurs (fonctions espion non appelées)
  3. Erreurs de comparaison dans les tests de formatage
  4. Problème avec `paypalTransactionId` qui est `undefined` au lieu de `null` dans le modèle Order

## Écrire de nouveaux tests

### Modèles
Pour tester un modèle, créez un fichier dans `tests/unit/models/`.

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { User } from '../../../models';
import { sequelize } from '../../../config/database';

describe('User Model', () => {
  // Avant chaque test, synchronisons la base de données
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  it('devrait créer un utilisateur avec succès', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'buyer'
    };
    
    const user = await User.create(userData);
    
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);
    expect(user.email).toBe(userData.email);
  });
});
```

### Contrôleurs
Pour tester un contrôleur, créez un fichier dans `tests/unit/controllers/`.

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUsers } from '../../../controllers/userController';

// Mock du modèle User
vi.mock('../../../models', () => ({
  User: {
    findAll: vi.fn()
  }
}));

describe('User Controller', () => {
  // Réinitialiser les mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait retourner tous les utilisateurs', async () => {
    // Préparer les données mockées
    const mockUsers = [{ id: 1, name: 'Test User' }];
    require('../../../models').User.findAll.mockResolvedValue(mockUsers);
    
    // Préparer la requête et la réponse
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    
    // Appeler la fonction du contrôleur
    await getUsers(req, res);
    
    // Vérifier le résultat
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });
});
```

## Résolution des problèmes courants

### 1. Erreurs avec la base de données

Si vous rencontrez des erreurs comme "Failed to open the referenced table", essayez ces solutions :

```bash
# Recréer la base de données de test
npm run setup:testdb

# S'assurer que le serveur MySQL est en cours d'exécution
# Pour Windows : vérifiez dans les services qu'il est actif

# Vérifier les informations d'identification dans .env
```

### 2. Erreurs de mock

Pour les erreurs comme "expected spy to be called with arguments" :

```javascript
// Assurez-vous de réinitialiser les mocks avant chaque test
beforeEach(() => {
  vi.clearAllMocks();
});

// Vérifiez que vous appelez correctement la fonction mockée dans votre implémentation
// Utilisez .mockImplementation() pour simuler le comportement de la fonction
```

### 3. Erreurs de comparaison

Pour les erreurs comme "expected '1 000,00 €' to be '1 000,00 €'" :

```javascript
// Utilisez toMatch au lieu de toBe pour les formats qui peuvent contenir 
// des caractères spéciaux ou des espacements différents
expect(formattedPrice).toMatch(/1\s?000,00\s?€/);
```

### 4. Valeurs undefined vs null

Pour corriger les erreurs liées à undefined vs null :

```javascript
// Dans le test
expect(order.paypalTransactionId).toBeFalsy(); // Plus permissif

// Ou corrigez le modèle pour initialiser explicitement à null
```

## Bonnes pratiques

1. **Isolation** : Chaque test doit être indépendant des autres
2. **Nommage** : Utilisez des noms descriptifs pour vos tests
3. **Base de données** : Pour les tests avec base de données, utilisez toujours les commandes avec `-db`
4. **Mocks** : Utilisez des mocks pour les dépendances externes et réinitialisez-les avant chaque test
5. **Nettoyage** : Les tables sont automatiquement recréées avant chaque suite de tests
6. **Séparation des tests** : Séparez les tests qui requièrent la base de données de ceux qui n'en ont pas besoin 