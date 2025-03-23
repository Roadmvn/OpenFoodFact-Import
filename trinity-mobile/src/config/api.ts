import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Récupérer le port API depuis les variables d'environnement
const API_PORT = process.env.API_PORT || Constants.expoConfig?.extra?.API_PORT || 3001;

// Adresse IP de votre PC lorsqu'il est connecté au partage de connexion
const HOTSPOT_IP = '172.20.10.2'; // Adresse IP actuelle de votre PC sur le partage de connexion

// L'URL de base pour l'API
const getBaseUrl = () => {
  // Pour le développement, utiliser l'adresse IP du partage de connexion
  return `http://${HOTSPOT_IP}:${API_PORT}`;
};

export const API_URL = getBaseUrl();

// Pour le débogage
console.log(`API_URL configurée: ${API_URL} (port: ${API_PORT})`);
