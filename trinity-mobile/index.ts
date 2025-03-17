import { AppRegistry, LogBox } from 'react-native';
import App from './App';

// Utiliser registerRootComponent au lieu de AppRegistry.registerComponent
// Enregistrer le composant principal de l'application
AppRegistry.registerComponent('main', () => App);

// Désactiver les avertissements en mode développement
LogBox.ignoreAllLogs(true);
