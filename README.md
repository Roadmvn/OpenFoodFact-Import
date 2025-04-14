# OpenFoodFact-Import

Application de gestion de produits alimentaires avec un scanner de codes-barres et une interface web/mobile.

## Structure du Projet

Le projet est divisé en trois parties principales :

- **backend** : API REST en Express.js connectée à une base de données MySQL
- **front** : Interface web en Nuxt.js
- **trinity-mobile** : Application mobile en React Native/Expo avec scanner de codes-barres natif

## Configuration de l'Environnement

Chaque partie du projet utilise des variables d'environnement pour sa configuration. Les fichiers `.env` sont déjà créés mais vous devrez les adapter à votre environnement.

### Variables d'Environnement

#### Backend (.env)
```env
# Configuration de la base de données
DB_DEV_USERNAME=votre_username
DB_DEV_PASSWORD=votre_password
DB_DEV_DATABASE=trinity
DB_DEV_HOST=127.0.0.1
DB_DEV_DIALECT=mysql

# Configuration JWT et session
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=1h
SESSION_SECRET=votre_secret_session
```

#### Frontend (.env)
```env
# Configuration du serveur front
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3001
```

#### Application Mobile (.env)
```env
# Configuration de l'API
API_PORT=3001
API_HOST=192.168.x.x  # Remplacez par l'IP de votre machine sur le réseau local
```

## Installation

### Prérequis
- Node.js v18 ou supérieur
- MySQL v5.7 ou supérieur
- Expo CLI (pour l'application mobile)

### Installation des Dépendances

```bash
# Installation des dépendances du backend
cd backend
npm install

# Installation des dépendances du frontend
cd ../front
npm install

# Installation des dépendances de l'application mobile
cd ../trinity-mobile
npm install
```

## Lancement des Applications

### Backend
```bash
cd backend
npm run dev
# Le serveur démarrera sur http://localhost:3001
```

### Frontend
```bash
cd front
npm run dev
# L'application démarrera sur http://localhost:3000
```

### Application Mobile
```bash
cd trinity-mobile
npm start
# Suivez les instructions d'Expo pour lancer sur un émulateur ou appareil physique
```

## Tests

Chaque partie du projet dispose de sa propre suite de tests :

### Backend
```bash
cd backend
npm test                  # Exécuter tous les tests
npm run test:unit         # Exécuter uniquement les tests unitaires
npm run test:with-db      # Exécuter les tests avec base de données
npm run test:models       # Exécuter uniquement les tests de modèles
npm run test:controllers  # Exécuter uniquement les tests de contrôleurs
npm run test:integration  # Exécuter les tests d'intégration
npm run test:coverage     # Exécuter les tests avec couverture de code
```

### Frontend
```bash
cd front
npm test
npm run test:watch        # Exécuter les tests en mode watch
```

### Application Mobile
```bash
cd trinity-mobile
npm test
```

## Scripts Utilitaires

### Backend

```bash
# Réinitialiser la base de données
cd backend
npm run resetDb

# Configurer la base de données de test
npm run setup:testdb

# Importer des produits depuis OpenFoodFacts
npm run import-products

# Créer des profils utilisateurs (admin, seller, buyer)
npm run create-profiles
```

### Docker

```bash
# Lancer tous les services avec Docker
docker-compose up

# Lancer en arrière-plan
docker-compose up -d

# Arrêter les services
docker-compose down

# Reconstruire les images
docker-compose build

# Voir les logs
docker-compose logs -f
```

## Documentation

Une documentation plus détaillée est disponible dans le dossier `docs` :

- Architecture du système
- Documentation de l'API
- Guides d'utilisation
- Schéma de base de données

## Contribution

Pour contribuer au projet :

1. Créez une branche à partir de `main`
2. Implémentez vos modifications
3. Soumettez une pull request vers `main`

## Déploiement CI/CD

Ce projet utilise GitHub Actions pour l'intégration continue. Le workflow est défini dans `.github/workflows/main.yml` et comprend :

- Tests automatisés du backend
- Tests automatisés du frontend
- Tests automatisés de l'application mobile

Le déploiement en production doit être configuré selon vos besoins spécifiques.

## Licence

Ce projet est sous licence propriétaire. Tous droits réservés.
