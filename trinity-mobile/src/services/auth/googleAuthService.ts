import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../config/api';
import axios from 'axios';
import { Alert } from 'react-native';

// Enregistrer le résultat du navigateur web
WebBrowser.maybeCompleteAuthSession();

// Interface pour les données utilisateur
interface UserData {
  id: number;
  email: string;
  name?: string;
  role: string;
}

// Interface pour la réponse d'authentification
interface AuthResponse {
  user: UserData;
  token: string;
  message: string;
}

/**
 * Service pour gérer l'authentification via Google
 */
class GoogleAuthService {
  /**
   * Initialise le processus de connexion avec Google
   * @returns Promise avec les données utilisateur en cas de succès
   */
  async login(): Promise<UserData | null> {
    try {
      // Récupérer l'adresse IP et le port du backend depuis l'API_URL
      const apiUrlParts = API_URL.match(/http:\/\/([^:]+):(\d+)/);
      const backendHost = apiUrlParts ? apiUrlParts[1] : 'localhost';
      const backendPort = apiUrlParts ? apiUrlParts[2] : '3001';
      
      // Utiliser un schéma d'application au lieu d'une URL HTTP
      const authUrl = `${API_URL}/auth/google`;
      
      console.log('Ouverture du navigateur pour authentification Google:', authUrl);
      
      // Ajouter un timeout pour éviter un blocage indéfini
      const authPromise = WebBrowser.openAuthSessionAsync(authUrl);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Délai d'authentification dépassé")), 30000)
      );
      
      try {
        const result = await Promise.race([authPromise, timeoutPromise]);
        
        // Vérifier si l'authentification a été annulée
        if (result.type === 'cancel' || result.type === 'dismiss') {
          console.log('Authentification Google annulée par l\'utilisateur');
          return null;
        }
        
        // Vérifier si l'authentification a réussi
        if (result.type === 'success') {
          const { url } = result;
          console.log('URL de redirection après authentification:', url);
          
          // Extraire le token de l'URL de résultat ou utiliser celui intercepté par le gestionnaire
          let token: string | null = null;
          
          try {
            const params = new URLSearchParams(url.split('?')[1]);
            token = params.get('token');
          } catch (error) {
            console.error('Erreur lors de l\'extraction du token de l\'URL de résultat:', error);
          }
          
          if (!token) {
            throw new Error('Token non trouvé dans l\'URL de redirection');
          }
          
          // Stocker le token
          await SecureStore.setItemAsync('userToken', token);
          
          // Récupérer les informations de l'utilisateur
          const userData = await this.getUserInfo(token);
          return userData;
        }
        
        throw new Error('Échec de l\'authentification Google');
      } catch (error) {
        console.error('Erreur lors de l\'authentification Google:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de l\'authentification Google:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion avec Google. Veuillez réessayer.');
      return null;
    }
  }
  
  /**
   * Récupère les informations de l'utilisateur à partir du token
   * @param token Token JWT
   * @returns Données de l'utilisateur
   */
  private async getUserInfo(token: string): Promise<UserData> {
    try {
      // Configurer l'en-tête d'autorisation
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Récupérer les informations de l'utilisateur
      const response = await axios.get<AuthResponse>(`${API_URL}/auth/me`, config);
      
      // Stocker les données utilisateur
      const userData = response.data.user;
      await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      throw new Error('Impossible de récupérer les informations utilisateur');
    }
  }
}

export default new GoogleAuthService();
