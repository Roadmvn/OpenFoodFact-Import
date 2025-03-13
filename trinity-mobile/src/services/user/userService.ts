import axios from 'axios';
import { API_URL } from '../../config/api';
import AuthService from '../auth/authService';
import { User } from '../../store/types/auth';

class UserService {
  static async getCurrentUser() {
    try {
      await AuthService.setupAxiosInterceptors();
      const response = await axios.get(`${API_URL}/api/user/current`);
      return response.data.user;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
      throw UserService.handleError(error);
    }
  }

  static async updateUserProfile(userData: Partial<User>) {
    try {
      console.log('UserService: Starting profile update API call', userData);
      await AuthService.setupAxiosInterceptors();
      
      // Récupérer le CSRF token si nécessaire
      console.log('UserService: Fetching CSRF token');
      const csrfResponse = await axios.get(`${API_URL}/api/user/csrf-token`);
      const csrfToken = csrfResponse.data.csrfToken;
      console.log('UserService: CSRF token received');
      
      console.log('UserService: Sending update request to API');
      // Utiliser la route correcte avec le préfixe /api/user
      const response = await axios.put(`${API_URL}/api/user/update_user`, userData, {
        headers: {
          'X-CSRF-Token': csrfToken
        },
        withCredentials: true
      });
      
      console.log('UserService: Profile update API response', response.data);
      return response.data.user;
    } catch (error) {
      console.error('UserService: Error updating user profile', error);
      throw UserService.handleError(error);
    }
  }

  static handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Une erreur est survenue';
      return new Error(message);
    }
    return error instanceof Error ? error : new Error('Une erreur est survenue');
  }
}

export default UserService;
