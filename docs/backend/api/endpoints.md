# Documentation API

## Points de Terminaison (Endpoints)

### Authentification
#### POST /api/auth/login
```json
{
  "email": "string",
  "password": "string"
}
```
**Réponse** : Token JWT

### Utilisateurs
#### GET /api/users
- Description : Liste des utilisateurs
- Authentification requise : Oui
- Rôle requis : Admin

#### POST /api/users
- Description : Création d'un utilisateur
- Authentification requise : Non

## Codes d'Erreur
- 200 : Succès
- 400 : Erreur de requête
- 401 : Non authentifié
- 403 : Non autorisé
- 404 : Ressource non trouvée
- 500 : Erreur serveur

## Format des Réponses
Toutes les réponses suivent le format :
```json
{
  "success": boolean,
  "data": object|array,
  "error": string|null
}
```
