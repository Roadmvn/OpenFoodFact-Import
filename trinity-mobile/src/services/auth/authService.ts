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
      
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        withCredentials: true
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
      if (axios.isAxiosError(error) && error.response) {
        console.error('Détails de l\'erreur Axios:', {
          status: error.response.status,
          headers: error.response.headers,
          response: error.response.data
        });
      }
      throw AuthService.handleError(error);
    }
  }

  static async register(credentials: RegisterCredentials) {
    try {
      // Restructurer les données pour correspondre au format attendu par le backend
      const { address, ...rest } = credentials;
      const formattedData = {
        ...rest,
        ...address
      };

      console.log('URL de l\'API:', `${API_URL}/auth/register`);
      console.log('Tentative d\'inscription avec:', formattedData);
      
      const response = await axios.post(`${API_URL}/auth/register`, formattedData, {
        withCredentials: true
      });
      console.log('Réponse complète du serveur:', response);
      console.log('Données de la réponse:', response.data);

      // Vérifier si le token est présent dans la réponse
      if (!response.data.token) {
        console.error('Structure de la réponse:', response.data);
        throw new Error('Token manquant dans la réponse');
      }

      // Sauvegarder le token
      await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
      
      return response.data;
    } catch (error) {
      console.error('Erreur complète dans AuthService.register:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Détails de l\'erreur Axios:', {
          status: error.response.status,
          headers: error.response.headers,
          response: error.response.data
        });
      }
      throw AuthService.handleError(error);
    }
  }

  static async logout() {
    try {
      console.log('Token avant déconnexion:', await this.getToken() ? 'présent' : 'absent');
      
      // Appel à l'API pour la déconnexion
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true
      });
      
      // Nettoyer les données locales
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      console.log('Token après déconnexion:', await this.getToken() ? 'présent' : 'supprimé');
      
    } catch (error) {
      console.error('Erreur complète dans AuthService.logout:', error);
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
    const token = await this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}

export default AuthService;
