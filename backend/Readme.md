# Backend OpenFoodFact-Import

## Description
API backend pour l'application OpenFoodFact-Import permettant l'importation et la gestion des données OpenFoodFact.

## Prérequis
- Node.js v14+
- MySQL v8+
- npm ou yarn

## Installation

### Configuration normale
```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Puis modifiez les variables d'environnement selon votre configuration

# Lancer le serveur de développement
npm run dev
```

## Base de données

### Configuration normale
Le serveur utilise `alter: true` par défaut pour la synchronisation de la base de données, ce qui permet de :
- Conserver les données existantes
- Mettre à jour la structure des tables si nécessaire

### Réinitialisation de la base de données
Pour réinitialiser complètement la base de données (⚠️ supprime toutes les données) :
```bash
node scripts/resetDb.js
```

## Tests

### Configuration des tests
Les tests utilisent une base de données dédiée pour éviter d'affecter les données de développement.

```bash
# Copier le fichier d'environnement de test
cp .env.example.test .env.test
# Puis modifiez les variables d'environnement selon votre configuration
```

### Exécution des tests
```bash
# Exécuter tous les tests sans base de données
npm test

# Exécuter tous les tests avec base de données
npm run test:with-db

# Exécuter seulement les tests de modèles avec base de données
npm run test:models:db

# Exécuter seulement les tests d'intégration avec base de données
npm run test:integration:db

# Exécuter les tests avec interface utilisateur
npm run test:ui

# Exécuter les tests avec couverture de code
npm run test:coverage
```

## Documentation API
La documentation de l'API est disponible via Swagger UI à l'adresse :
```
http://localhost:3001/api-docs
```

## Commandes disponibles

### Développement
```bash
# Lancer le serveur de développement
npm run dev
```

### Production
```bash
# Lancer en production
npm start
```

## Structure du projet
```
backend/
├── config/         # Configuration (DB, Swagger, etc.)
├── controllers/    # Contrôleurs de l'API
├── middleware/     # Middlewares Express
├── migrations/     # Migrations Sequelize
├── models/         # Modèles Sequelize
├── routes/         # Routes de l'API
├── scripts/        # Scripts utilitaires
├── tests/          # Tests unitaires et d'intégration
│   ├── unit/       # Tests unitaires
│   └── integration/# Tests d'intégration
└── app.js          # Point d'entrée de l'application