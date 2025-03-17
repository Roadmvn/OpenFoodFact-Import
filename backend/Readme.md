# Backend Trinity

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

## Commandes disponibles

### Développement
```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### Production
```bash
# Lancer en production
npm start
```