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
└── app.js          # Point d'entrée de l'application