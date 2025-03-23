import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../config/api';
import { LoginCredentials, RegisterCredentials } from '../../store/types/auth';

const TOKEN_KEY = 'userToken';

class AuthService {
  static async login(credentials: LoginCredentials) {
    try {
      console.log('URL de l\'API:', `${API_URL}/auth/login`);
      console.log('Tentative de connexion avec:', credentials);
      
      // Ajout d'un timeout de 10 secondes pour éviter les attentes infinies
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        withCredentials: true,
        timeout: 10000 // 10 secondes de timeout
      });
      console.log('Réponse complète du serveur:', response);
      console.log('Données de la réponse:', response.data);
      
      if (!response.data.token) {
        throw new Error('Token manquant dans la réponse');
      }

      // Sauvegarder le token
      await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
      
      return response.data;
    } catch (error) {
      console.error('Erreur complète dans AuthService.login:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error('Timeout de la requête - Le serveur ne répond pas');
          throw new Error('Le serveur ne répond pas. Veuillez vérifier votre connexion ou réessayer plus tard.');
        }
        
        if (error.response) {
          console.error('Détails de l\'erreur Axios:', {
            status: error.response.status,
            headers: error.response.headers,
            response: error.response.data
          });
        } else if (error.request) {
          // La requête a été faite mais pas de réponse reçue
          console.error('Pas de réponse reçue du serveur');
          throw new Error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion réseau.');
        }
      }
      throw AuthService.handleError(error);
    }
  }

  static async register(credentials: RegisterCredentials) {
    try {
      const { address, ...rest } = credentials;
      const formattedData = {
        ...rest,
        ...address
      };
      
      const response = await axios.post(`${API_URL}/auth/register`, formattedData, {
        withCredentials: true,
        timeout: 10000 // 10 secondes de timeout
      });
      
      // On retourne simplement la réponse sans vérifier le token
      return response.data;
    } catch (error) {
      console.error('Erreur complète dans AuthService.register:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error('Timeout de la requête - Le serveur ne répond pas');
          throw new Error('Le serveur ne répond pas. Veuillez vérifier votre connexion ou réessayer plus tard.');
        }
        
        if (error.response) {
          console.error('Détails de l\'erreur Axios:', {
            status: error.response.status,
            headers: error.response.headers,
            response: error.response.data
          });
        } else if (error.request) {
          // La requête a été faite mais pas de réponse reçue
          console.error('Pas de réponse reçue du serveur');
          throw new Error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion réseau.');
        }
      }
      throw AuthService.handleError(error);
    }
  }

  static async logout() {
    try {
      const token = await AuthService.getToken();
      console.log('Token avant déconnexion:', token ? 'présent' : 'absent');
      
      // Appel à l'API pour la déconnexion
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true,
        timeout: 10000 // 10 secondes de timeout
      });
      
      // Nettoyer les données locales
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      console.log('Token après déconnexion:', await AuthService.getToken() ? 'présent' : 'supprimé');
      
    } catch (error) {
      console.error('Erreur complète dans AuthService.logout:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error('Timeout de la requête - Le serveur ne répond pas');
          throw new Error('Le serveur ne répond pas. Veuillez vérifier votre connexion ou réessayer plus tard.');
        }
        
        if (error.response) {
          console.error('Détails de l\'erreur Axios:', {
            status: error.response.status,
            headers: error.response.headers,
            response: error.response.data
          });
        } else if (error.request) {
          // La requête a été faite mais pas de réponse reçue
          console.error('Pas de réponse reçue du serveur');
          throw new Error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion réseau.');
        }
      }
      throw AuthService.handleError(error);
    }
  }

  static handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Une erreur est survenue';
      return new Error(message);
    }
    return error instanceof Error ? error : new Error('Une erreur est survenue');
  }

  static async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }

  static async setupAxiosInterceptors() {
    const token = await AuthService.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}

export default AuthService;
