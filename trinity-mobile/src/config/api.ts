import { Platform } from 'react-native';

const API_PORT = 3001; // Correspond au port du backend

// L'URL de base change selon la plateforme
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Pour l'émulateur Android
    return `http://10.0.2.2:${API_PORT}`;
  } else if (Platform.OS === 'ios') {
    // Pour l'émulateur iOS
    return `http://localhost:${API_PORT}`;
  } else {
    // Pour le web ou autre
    return `http://localhost:${API_PORT}`;
  }
};

export const API_URL = getBaseUrl();
