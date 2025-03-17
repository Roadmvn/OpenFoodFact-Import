## Structure du Projet

### Backend (Express.js)
- [Architecture système](./backend/architecture/architecture-systeme.md)
- [Documentation API](./backend/api/endpoints.md)
- [Schéma de base de données](./backend/architecture/diagramme-base-donnees.md)

### Frontend (Nuxt.js)
- [Architecture des composants](./frontend/architecture/structure-composants.md)
- [Guide d'installation](./frontend/guides/installation.md)

### Documentation Commune
- [Guide de contribution](./commun/contribution.md)
- [Conventions de code](./commun/conventions-code.md)

## Prérequis Techniques
- Node.js
- MySQL
- PayPal API (pour les paiements)

## Structure des Dossiers

### Backend
```
backend/
├── config/         # Configuration de la base de données et autres
├── controllers/    # Contrôleurs de l'API
├── middleware/     # Middlewares Express
├── migrations/     # Migrations Sequelize
├── models/         # Modèles Sequelize
├── routes/         # Routes de l'API
└── app.js         # Point d'entrée de l'application
```

### Frontend
```
frontend/
├── components/     # Composants Nuxt
├── pages/         # Pages de l'application
├── stores/        # Stores Pinia
├── assets/        # Ressources statiques
└── layouts/       # Layouts Nuxt
