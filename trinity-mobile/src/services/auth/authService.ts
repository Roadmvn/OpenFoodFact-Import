import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../config/api';
import { LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse } from '../../store/types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('URL de l\'API:', `${API_URL}/auth/login`);
      console.log('Tentative de connexion avec:', credentials);
      
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      console.log('Réponse complète du serveur:', response);
      console.log('Données de la réponse:', response.data);
      
      // Vérification de la structure de la réponse
      if (!response.data) {
        throw new Error('Réponse vide du serveur');
      }

      // Récupération du token et de l'utilisateur avec une structure plus flexible
      const token = response.data.token || response.data.access_token || response.data.accessToken;
      const user = response.data.user || response.data.userData || response.data;

      if (!token) {
        console.error('Structure de la réponse:', response.data);
        throw new Error('Token manquant dans la réponse');
      }

      // Stocker le token et l'utilisateur de manière sécurisée
      await SecureStore.setItemAsync(TOKEN_KEY, String(token));
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      
      // Configure axios avec le nouveau token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user };
    } catch (error) {
      console.error('Erreur complète dans AuthService.login:', error);
      if (axios.isAxiosError(error)) {
        console.error('Détails de l\'erreur Axios:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
        throw new Error(error.response?.data?.message || 'Erreur de connexion');
      }
      throw error;
    }
  }

  static async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      console.log('URL de l\'API:', `${API_URL}/auth/register`);
      console.log('Tentative d\'inscription avec:', credentials);
      
      const response = await axios.post(`${API_URL}/auth/register`, credentials);
      console.log('Réponse complète du serveur:', response);
      console.log('Données de la réponse:', response.data);
      
      // Vérification de la structure de la réponse
      if (!response.data) {
        throw new Error('Réponse vide du serveur');
      }

      // Récupération du token et de l'utilisateur avec une structure plus flexible
      const token = response.data.token || response.data.access_token || response.data.accessToken;
      const user = response.data.user || response.data.userData || response.data;

      if (!token) {
        console.error('Structure de la réponse:', response.data);
        throw new Error('Token manquant dans la réponse');
      }

      // Stocker le token et l'utilisateur de manière sécurisée
      await SecureStore.setItemAsync(TOKEN_KEY, String(token));
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      
      // Configure axios avec le nouveau token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user };
    } catch (error) {
      console.error('Erreur complète dans AuthService.register:', error);
      if (axios.isAxiosError(error)) {
        console.error('Détails de l\'erreur Axios:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
        throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
      }
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      // D'abord, récupérer le token actuel
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      console.log('Token avant déconnexion:', token ? 'présent' : 'absent');
      
      if (token) {
        // Configurer le header avec le token pour la requête de déconnexion
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Appel à l'API pour la déconnexion
      await axios.post(`${API_URL}/auth/logout`);
      
      // Nettoyer les données locales
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      
      // Vérifier que le token a bien été supprimé
      const tokenAfter = await SecureStore.getItemAsync(TOKEN_KEY);
      console.log('Token après déconnexion:', tokenAfter ? 'toujours présent' : 'supprimé');
      
      // Supprimer le header d'autorisation
      delete axios.defaults.headers.common['Authorization'];
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  static async getUser(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  static async setupAxiosInterceptors(): Promise<void> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}

export default AuthService;
