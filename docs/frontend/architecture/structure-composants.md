# Architecture Frontend

## Technologies Principales
- Nuxt.js 3
- TypeScript
- Tailwind CSS
- Pinia pour la gestion d'état
- Nuxt Auth pour l'authentification

## Structure du Projet
```
frontend/
├── .nuxt/              # Fichiers générés par Nuxt
├── assets/            # Ressources statiques
├── components/        # Composants réutilisables
├── layouts/          # Layouts de l'application
├── middleware/       # Middleware Nuxt
├── pages/           # Pages de l'application
├── plugins/         # Plugins Nuxt
├── public/          # Fichiers publics
├── server/          # API côté serveur
├── stores/          # Stores Pinia
└── types/           # Types TypeScript
```

## Pages Principales
- `/` : Page d'accueil
- `/auth` : Authentification
- `/products` : Liste des produits
- `/cart` : Panier d'achat
- `/orders` : Gestion des commandes
- `/profile` : Profil utilisateur

## Composants
Les composants sont organisés par fonctionnalité :
```
components/
├── auth/           # Composants d'authentification
├── cart/           # Composants du panier
├── common/         # Composants partagés
├── layout/         # Composants de mise en page
├── orders/         # Composants de commande
└── products/       # Composants de produits
```

## Stores Pinia
```
stores/
├── auth.ts        # État d'authentification
└── cart.ts        # État du panier
```

## Intégrations
- API Backend via Fetch/Axios
- PayPal pour les paiements
- Services d'authentification

## Styles
- Tailwind CSS pour le style
- Classes utilitaires personnalisées
- Thème personnalisé

## Sécurité
- Authentification via Nuxt Auth
- Protection des routes
- Validation des formulaires
- Gestion sécurisée des tokens
