import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../config/api';
import { LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse } from '../../store/types/auth';

const TOKEN_KEY = 'auth_token';

class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('Tentative de connexion avec:', credentials);
      console.log('URL de l\'API:', `${API_URL}/auth/login`);
      
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      console.log('Réponse du serveur:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Erreur complète:', error);
      if (axios.isAxiosError(error)) {
        console.error('Détails de l\'erreur:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw new Error(error.response?.data?.message || 'Erreur de connexion');
      }
      throw error;
    }
  }

  static async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erreur d\'inscription');
      }
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        // Appel à l'API de déconnexion
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Supprimer le token
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // On supprime quand même le token en cas d'erreur
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      throw error;
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
      // return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  // Configure axios avec le token pour toutes les requêtes
  static async setupAxiosInterceptors() {
    const token = await AuthService.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Intercepteur pour gérer les erreurs d'authentification
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AuthService.logout();
          // Vous pouvez ajouter ici la logique pour rediriger vers la page de connexion
        }
        return Promise.reject(error);
      }
    );
  }
}

export default AuthService;
