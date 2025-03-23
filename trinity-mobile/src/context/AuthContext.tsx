import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';

// Interface pour les données de l'utilisateur
export interface User {
  id: number;
  email: string;
  name?: string;
  role: 'buyer'; // L'application mobile est exclusivement pour les acheteurs
}

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider du contexte
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  
  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        
        if (!token) {
          setUser(null);
          return;
        }
        
        // Récupérer les données de l'utilisateur depuis le stockage local
        const userData = await AsyncStorage.getItem('user_data');
        
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          // Si les données utilisateur ne sont pas disponibles, les récupérer depuis l'API
          // Cette partie serait à implémenter avec un appel API réel
          // Pour l'instant, on simule un utilisateur acheteur
          const mockUser: User = {
            id: 1,
            email: 'acheteur@example.com',
            name: 'Acheteur Test',
            role: 'buyer'
          };
          
          setUser(mockUser);
          await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des données utilisateur:', err);
        setError(err.message || 'Erreur lors du chargement des données utilisateur');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, [token]);
  
  // Fonction de connexion
  const login = async (email: string, password: string) => {
    // Cette fonction serait à implémenter avec un appel API réel
    // Pour l'instant, on simule une connexion réussie
    try {
      setLoading(true);
      setError(null);
      
      // Simulation d'un délai de réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulation d'un utilisateur connecté
      const mockUser: User = {
        id: 1,
        email,
        name: 'Acheteur Test',
        role: 'buyer'
      };
      
      setUser(mockUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));
      
      // Dispatch de l'action pour mettre à jour le token dans Redux
      // Cette partie dépend de l'implémentation de votre store Redux
      // dispatch(setToken('mock_token'));
      
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      setError(err.message || 'Erreur lors de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction de déconnexion
  const logout = async () => {
    try {
      setLoading(true);
      
      // Supprimer les données utilisateur du stockage local
      await AsyncStorage.removeItem('user_data');
      setUser(null);
      
      // Dispatch de l'action pour supprimer le token dans Redux
      // Cette partie dépend de l'implémentation de votre store Redux
      // dispatch(clearToken());
      
    } catch (err: any) {
      console.error('Erreur lors de la déconnexion:', err);
      setError(err.message || 'Erreur lors de la déconnexion');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction d'inscription
  const register = async (email: string, password: string, name: string) => {
    // Cette fonction serait à implémenter avec un appel API réel
    // Pour l'instant, on simule une inscription réussie
    try {
      setLoading(true);
      setError(null);
      
      // Simulation d'un délai de réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulation d'un utilisateur inscrit
      const mockUser: User = {
        id: 1,
        email,
        name,
        role: 'buyer'
      };
      
      setUser(mockUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));
      
      // Dispatch de l'action pour mettre à jour le token dans Redux
      // Cette partie dépend de l'implémentation de votre store Redux
      // dispatch(setToken('mock_token'));
      
    } catch (err: any) {
      console.error('Erreur lors de l\'inscription:', err);
      setError(err.message || 'Erreur lors de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Valeur du contexte
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
