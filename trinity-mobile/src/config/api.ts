import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Récupérer le port et l'hôte API depuis les variables d'environnement
const API_PORT = process.env.API_PORT || Constants.expoConfig?.extra?.API_PORT || 3001;
const API_HOST = process.env.API_HOST || Constants.expoConfig?.extra?.API_HOST || '127.0.0.1';

// L'URL de base pour l'API
const getBaseUrl = () => {
  return `http://${API_HOST}:${API_PORT}`;
};

export const API_URL = getBaseUrl();

// Pour le débogage
console.log(`API_URL configurée: ${API_URL} (port: ${API_PORT}, hôte: ${API_HOST})`);
