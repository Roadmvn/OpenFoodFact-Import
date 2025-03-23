import { LogBox } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// Utiliser registerRootComponent au lieu de AppRegistry.registerComponent
// Enregistrer le composant principal de l'application
registerRootComponent(App);

// Désactiver les avertissements en mode développement
LogBox.ignoreAllLogs(true);
