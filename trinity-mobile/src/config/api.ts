import { Platform } from 'react-native';

const API_PORT = 3001; // Correspond au port du backend

// L'URL de base change selon la plateforme
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Pour l'émulateur Android, utiliser 10.0.2.2
    // Pour un appareil physique, utiliser l'adresse IP de votre machine
    // Détecter si on est sur un émulateur ou un appareil physique
    const isEmulator = false; // À modifier selon votre environnement
    
    return isEmulator 
      ? `http://10.0.2.2:${API_PORT}`
      : `http://10.188.177.128:${API_PORT}`; // Remplacer par l'adresse IP de votre machine
  } else if (Platform.OS === 'ios') {
    // Pour l'émulateur iOS
    return `http://localhost:${API_PORT}`;
  } else {
    // Pour le web ou autre
    return `http://localhost:${API_PORT}`;
  }
};

export const API_URL = getBaseUrl();

// Pour le débogage
console.log(`API_URL configurée: ${API_URL}`);
