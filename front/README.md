# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Tests

Actuellement, aucun test n'est configuré pour le frontend. Voici un plan pour mettre en place des tests :

### Configuration recommandée

Pour ajouter des tests, nous recommandons d'installer les dépendances suivantes :

```bash
# Installation de Vitest (compatible avec Nuxt)
npm install --save-dev vitest @nuxt/test-utils @vue/test-utils happy-dom

# Installation de la couverture de code
npm install --save-dev @vitest/coverage-c8
```

### Structure de tests proposée

```
front/
├── tests/
│   ├── components/   # Tests des composants Vue
│   ├── stores/       # Tests des stores Pinia
│   ├── pages/        # Tests des pages
│   └── utils/        # Tests des utilitaires
└── vitest.config.ts  # Configuration de Vitest
```

### Commandes de test à configurer

Ajoutez ces scripts dans le `package.json` :

```json
"scripts": {
  // ... scripts existants
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

### Exemple de test de composant

```typescript
// tests/components/ExampleComponent.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExampleComponent from '../../components/ExampleComponent.vue'

describe('ExampleComponent', () => {
  it('affiche le texte correctement', () => {
    const wrapper = mount(ExampleComponent, {
      props: {
        title: 'Test Title'
      }
    })
    
    expect(wrapper.text()).toContain('Test Title')
  })
})
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
