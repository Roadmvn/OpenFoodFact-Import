# Trinity Mobile

Application mobile pour la gestion des produits alimentaires, intégrant un scanner de codes-barres natif et une synchronisation avec l'application web.

## Fonctionnalités principales

### Scanner de codes-barres natif

L'application dispose d'un scanner de codes-barres natif optimisé pour Android et iOS, avec les fonctionnalités suivantes :

- **Mode torche** : Activation/désactivation de la lampe torche pour les environnements peu éclairés
- **Guide visuel** : Cadre avec coins verts pour aider à positionner correctement le code-barres
- **Retour haptique** : Vibration lors de la détection d'un code-barres
- **Optimisation automatique** : Ajustement de la qualité d'image en fonction des capacités de l'appareil
- **Mode développement** : Simulation de détection de codes-barres pour faciliter les tests

### Autres fonctionnalités

- Intégration de paiement PayPal (API REST)
- Intégration de paiement Stripe
- Synchronisation des produits entre l'application web et mobile

## Architecture technique

### Technologies utilisées

- **React Native** : Framework de développement mobile
- **Expo** : Plateforme de développement React Native
- **TypeScript** : Langage de programmation typé
- **React Navigation** : Navigation entre les écrans
- **react-native-vision-camera** : Accès natif à la caméra
- **@react-native-ml-kit/barcode-scanning** : Analyse des codes-barres

### Structure du projet

- **src/screens** : Écrans de l'application
  - **camera** : Écrans liés à la caméra et au scan de codes-barres
- **src/services** : Services de l'application
  - **barcode** : Service pour la gestion des codes-barres
- **src/context** : Contextes React pour la gestion de l'état global
- **src/navigation** : Configuration de la navigation

## Implémentation du scanner de codes-barres

Le scanner de codes-barres est implémenté en utilisant les composants natifs qui s'appuient sur Kotlin pour Android et Swift pour iOS, conformément aux exigences du projet.

### Modes de scanner

1. **Mode simulation (ScanScreen.tsx)** : Permet d'entrer manuellement des codes-barres pour tester le flux sans utiliser la caméra
2. **Mode natif (NativeScanScreen.tsx)** : Utilise la caméra de l'appareil pour scanner des codes-barres

### Détails d'implémentation du scanner natif

Le scanner natif utilise `react-native-vision-camera` pour l'accès à la caméra et `@react-native-ml-kit/barcode-scanning` pour l'analyse des codes-barres. Voici les détails techniques de l'implémentation :

#### Gestion de la caméra

- Utilisation de `useCameraDevice('back')` pour accéder à la caméra arrière
- Vérification des permissions de caméra via `Camera.requestCameraPermission()`
- Gestion du mode torche avec vérification de disponibilité du flash
- Capture d'image optimisée pour la détection de codes-barres

#### Analyse des codes-barres

- Utilisation de `BarcodeScanning.scan(imageUri)` pour l'analyse des images
- Support des formats EAN-13, EAN-8, QR Code, UPC-A, UPC-E, Code 39 et Code 128
- Traitement des résultats avec formatage et validation

#### Mode développement

- En mode développement sur Android, le scanner simule la détection de codes-barres
- Plusieurs codes-barres de test sont disponibles pour simuler différents produits
- Un indicateur visuel informe l'utilisateur que le mode simulation est actif
- La simulation concerne uniquement la détection du code-barres, pas la capture d'image

#### Optimisations

- Qualité d'image adaptée aux capacités de l'appareil
- Vérification de la disponibilité du flash avant activation
- Gestion des erreurs avec messages explicites pour l'utilisateur
- Interface utilisateur adaptée à l'état du scanner (chargement, analyse, détection)

### Utilisation du service BarcodeScannerService

Un service dédié `BarcodeScannerService` centralise la logique de scan avec les méthodes suivantes :

- `checkCameraPermission()` : Vérifie et demande les permissions de caméra
- `processMLKitBarcode(barcode)` : Traite le résultat du scan de ML Kit
- `processBarcodeScanResult(value, format)` : Traite le résultat du scan
- `getFormatName(format)` : Obtient le nom lisible du format de code-barres
- `getOptimalImageQuality()` : Calcule la qualité d'image optimale selon l'appareil
- `isTorchAvailable(device)` : Vérifie si le mode torche est disponible sur l'appareil

### Configuration requise

Pour utiliser le scanner de codes-barres, les permissions suivantes doivent être configurées dans `app.json` :

#### Android

```json
"android": {
  "permissions": [
    "android.permission.CAMERA",
    "android.permission.VIBRATE"
  ]
}
```

#### iOS

```json
"ios": {
  "infoPlist": {
    "NSCameraUsageDescription": "Cette application utilise la caméra pour scanner les codes-barres des produits."
  }
}
```

### Dépannage

Si vous rencontrez des problèmes avec le scanner de codes-barres, voici quelques solutions :

1. **Flash non disponible** : Vérifiez que votre appareil dispose d'un flash. Sur les émulateurs, le flash n'est généralement pas disponible.
2. **Erreurs de détection** : Assurez-vous que le code-barres est bien éclairé et centré dans le cadre.
3. **Performances lentes** : Réduisez la qualité d'image dans `BarcodeScannerService.getOptimalImageQuality()`.

## Développement

### Prérequis

- Node.js (version 14 ou supérieure)
- Yarn ou npm
- Expo CLI
- Android Studio (pour le développement Android)
- Xcode (pour le développement iOS, macOS uniquement)

### Installation

```bash
# Installer les dépendances
yarn install

# Démarrer l'application
yarn start
```

### Commandes disponibles

- `yarn start` : Démarrer le serveur de développement Expo
- `yarn android` : Démarrer l'application sur un émulateur ou un appareil Android
- `yarn ios` : Démarrer l'application sur un simulateur ou un appareil iOS
- `yarn web` : Démarrer l'application en mode web
- `yarn test` : Exécuter les tests
- `yarn lint` : Vérifier le code avec ESLint
- `yarn build:android` : Construire l'APK pour Android
- `yarn build:ios` : Construire l'application pour iOS

## Contribution

Pour contribuer au projet, veuillez suivre les étapes suivantes :

1. Créer une branche à partir de `main`
2. Implémenter les modifications
3. Créer une pull request vers `main`
4. Attendre la revue de code

## Licence

Ce projet est sous licence propriétaire. Tous droits réservés.
