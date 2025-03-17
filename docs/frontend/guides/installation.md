# Guide d'Installation Frontend

## Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn
- Backend API en cours d'exécution

## Installation

1. Cloner le repository
```bash
git clone https://github.com/votre-repo/T-DEV-702-Api.git
cd T-DEV-702-Api/frontend
```

2. Installer les dépendances
```bash
npm install
# ou
yarn install
```

3. Configuration
- Copier le fichier `.env.example` en `.env`
- Configurer les variables d'environnement :
  ```env
  NUXT_PUBLIC_API_BASE=http://localhost:3000
  NUXT_PUBLIC_PAYPAL_CLIENT_ID=votre_client_id_paypal
  ```

4. Lancer le serveur de développement
```bash
npm run dev
# ou
yarn dev
```

L'application sera disponible sur `http://localhost:3000`

## Scripts Disponibles
- `npm run dev` : Mode développement
- `npm run build` : Construction pour production
- `npm run generate` : Génération statique
- `npm run preview` : Prévisualisation de la production

## Configuration Nuxt
Le fichier `nuxt.config.ts` contient la configuration principale :
```typescript
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  css: ['~/assets/css/main.css'],
  // autres configurations...
})
```

## Structure des Dossiers Principaux
```
frontend/
├── components/     # Composants réutilisables
├── pages/         # Pages de l'application
├── stores/        # Stores Pinia
└── public/        # Fichiers statiques
```

## Comptes de Test
Voici les différents comptes disponibles pour tester l'application :

### Comptes Administrateur
- Email : admin@gmail.com
  - Mot de passe : Jiojio000608.
- Email : tudy@epitech.eu
  - Mot de passe : Jiojio000608.

### Compte Utilisateur
- Email : houzeyu77@gmail.com
  - Mot de passe : Jiojio000608.
  - Note : Connexion possible via Google également

### Compte Vendeur
- Email : seller@epitech.eu
  - Mot de passe : Jiojio000608.

## Déploiement
1. Construire l'application
```bash
npm run build
```

2. Les fichiers de production seront dans le dossier `.output/`

3. Démarrer en production
```bash
node .output/server/index.mjs
