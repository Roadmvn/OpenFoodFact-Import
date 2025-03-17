# Architecture du Backend

## Technologies Utilisées
- Express.js comme framework backend
- Sequelize comme ORM
- MySQL comme base de données
- JWT pour l'authentification
- PayPal pour les paiements

## Structure du Projet
```
backend/
├── config/
│   ├── config.js          # Configuration de la base de données
│   └── database.js        # Instance Sequelize
├── controllers/
│   ├── authController.js  # Gestion de l'authentification
│   ├── cartController.js  # Gestion du panier
│   ├── orderController.js # Gestion des commandes
│   └── productController.js # Gestion des produits
├── middleware/
│   ├── auth.js           # Middleware d'authentification
│   └── validation.js     # Validation des requêtes
├── models/
│   ├── cart.js          # Modèle de panier
│   ├── contact.js       # Modèle de contact
│   ├── internalproduct.js # Modèle de produit interne
│   ├── invoice.js       # Modèle de facture
│   ├── order.js         # Modèle de commande
│   ├── orderitem.js     # Modèle d'item de commande
│   ├── products.js      # Modèle de produit
│   └── user.js          # Modèle utilisateur
└── routes/
    ├── auth.js          # Routes d'authentification
    ├── cart.js          # Routes du panier
    ├── order.js         # Routes des commandes
    └── product.js       # Routes des produits
```

## Points d'API Principaux
- `/api/auth` : Authentification et gestion des utilisateurs
- `/api/products` : Gestion des produits
- `/api/cart` : Gestion du panier
- `/api/orders` : Gestion des commandes
- `/api/contact` : Formulaire de contact

## Sécurité
- Authentification via JWT
- Validation des données entrantes
- Middleware de vérification des rôles
- Protection CORS configurée

## Base de Données
- MySQL avec Sequelize ORM
- Migrations automatisées
- Relations définies dans les modèles

## Intégrations
- PayPal pour le traitement des paiements
- Service d'envoi d'emails pour les notifications
