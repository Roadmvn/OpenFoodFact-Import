# Guide de Contribution

## Processus de Développement

### 1. Branches
- `main` : Production
- `develop` : Développement
- `feature/*` : Nouvelles fonctionnalités
- `bugfix/*` : Corrections de bugs
- `hotfix/*` : Corrections urgentes

### 2. Commits
Format : `type(scope): description`

Types :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage
- `refactor` : Refactoring
- `test` : Tests
- `chore` : Maintenance

### 3. Pull Requests
- Titre clair et descriptif
- Description détaillée des changements
- Tests passés
- Code review obligatoire
- Pas de conflits avec la branche cible

## Tests
- Tests unitaires obligatoires
- Tests d'intégration pour les fonctionnalités critiques
- Coverage minimum : 80%

## Déploiement
1. Merge dans `develop`
2. Tests automatisés
3. Review et validation
4. Merge dans `main`
5. Déploiement automatique

## Qualité du Code
- ESLint pour le linting
- Prettier pour le formatage
- Husky pour les pre-commit hooks
- SonarQube pour l'analyse de code
