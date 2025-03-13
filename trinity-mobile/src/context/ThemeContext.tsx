// src/context/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Clé pour stocker le mode daltonien dans AsyncStorage
const COLORBLIND_MODE_KEY = 'colorblind_mode';
// Clé pour vérifier si l'application a déjà été initialisée
const APP_INITIALIZED_KEY = 'app_initialized';

// Définition des couleurs pour les deux thèmes
export const themes = {
  standard: {
    primary: '#4A90E2', // Bleu ciel clair
    secondary: '#3B78C1', // Bleu ciel plus foncé
    accent: '#4CAF50', // Vert selon la palette du projet
    background: '#f5f5f5',
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#FF5252',
    buttonText: '#FFFFFF',
    gradientStart: '#4A90E2',
    gradientEnd: '#4CAF50',
    cancelButtonBorder: '#4A90E2',
    cancelButtonText: '#4A90E2',
    saveButtonBackground: '#4CAF50',
    headerBackground: '#4A90E2',
    headerText: '#FFFFFF',
    switchTrackColor: { false: '#767577', true: '#4CAF50' },
    switchThumbColor: { false: '#f4f3f4', true: '#FFFFFF' },
    switchIOS_BG: '#3e3e3e',
    cardGradient: ['#4A90E2', '#4CAF50'],
    accentGradient: ['#4CAF50', '#4A90E2'], // Gradient pour les boutons d'accent (vert-bleu)
    buttonGradient: ['#4CAF50', '#4A90E2'], // Gradient pour tous les boutons (vert-bleu)
  },
  colorblind: {
    // Palette adaptée pour les daltoniens avec contraste élevé
    primary: '#0C7BDC', // Bleu optimisé pour les daltoniens
    secondary: '#0A69C0', // Bleu secondaire optimisé
    accent: '#E66100', // Orange optimisé pour les daltoniens
    background: '#f5f5f5',
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#D32F2F', // Rouge plus foncé
    buttonText: '#FFFFFF',
    gradientStart: '#0C7BDC',
    gradientEnd: '#E66100',
    cancelButtonBorder: '#0C7BDC',
    cancelButtonText: '#0C7BDC',
    saveButtonBackground: '#E66100',
    headerBackground: '#0C7BDC',
    headerText: '#FFFFFF',
    switchTrackColor: { false: '#767577', true: '#E66100' },
    switchThumbColor: { false: '#f4f3f4', true: '#FFFFFF' },
    switchIOS_BG: '#3e3e3e',
    cardGradient: ['#0C7BDC', '#E66100'],
    accentGradient: ['#E66100', '#0C7BDC'], // Gradient pour les boutons d'accent (orange-bleu)
    buttonGradient: ['#E66100', '#0C7BDC'], // Gradient pour tous les boutons (orange-bleu)
  },
};

// Type pour les thèmes
export type ThemeType = typeof themes.standard;

// Interface pour le contexte
interface ThemeContextType {
  theme: ThemeType;
  colorBlindMode: boolean;
  toggleColorblindMode: () => void;
  setColorblindMode: (value: boolean) => void;
}

// Création du contexte avec une valeur par défaut
const ThemeContext = createContext<ThemeContextType>({
  theme: themes.standard,
  colorBlindMode: false,
  toggleColorblindMode: () => {},
  setColorblindMode: () => {},
});

// Hook personnalisé pour utiliser le contexte
export const useTheme = () => useContext(ThemeContext);

// Fonction pour effacer toutes les données de l'application
const clearAllAppData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
    console.log('ThemeContext - Toutes les données ont été effacées');
  } catch (error) {
    console.error('Erreur lors de l\'effacement des données:', error);
  }
};

// Provider du thème
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TOUJOURS initialiser avec le mode standard (false) par défaut
  const [colorBlindMode, setIsColorblindMode] = useState(false);
  const theme = colorBlindMode ? themes.colorblind : themes.standard;

  // Fonction pour définir directement le mode daltonien avec mise à jour du state et stockage
  const setColorblindModeWithStorage = async (value: boolean) => {
    try {
      console.log('ThemeContext - Définition du mode daltonien:', value);
      setIsColorblindMode(value);
      await AsyncStorage.setItem(COLORBLIND_MODE_KEY, value.toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode daltonien:', error);
    }
  };

  // Initialiser l'application au premier démarrage
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Vérifier si l'application a déjà été initialisée
        const isInitialized = await AsyncStorage.getItem(APP_INITIALIZED_KEY);
        
        if (isInitialized !== 'true') {
          console.log('ThemeContext - Première initialisation de l\'application');
          
          // Effacer toutes les données existantes
          await clearAllAppData();
          
          // Définir le mode normal par défaut
          await AsyncStorage.setItem(COLORBLIND_MODE_KEY, 'false');
          
          // Marquer l'application comme initialisée
          await AsyncStorage.setItem(APP_INITIALIZED_KEY, 'true');
          
          console.log('ThemeContext - Application initialisée avec le mode normal par défaut');
        } else {
          console.log('ThemeContext - Application déjà initialisée');
        }
        
        // Toujours commencer en mode normal
        setIsColorblindMode(false);
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
        // En cas d'erreur, forcer le mode normal
        setIsColorblindMode(false);
      }
    };
    
    initializeApp();
  }, []);

  // Fonction pour basculer le mode daltonien
  const toggleColorblindMode = async () => {
    try {
      const newMode = !colorBlindMode;
      console.log('ThemeContext - Changement du mode daltonien:', newMode);
      setIsColorblindMode(newMode);
      await AsyncStorage.setItem(COLORBLIND_MODE_KEY, newMode.toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode daltonien:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, colorBlindMode, toggleColorblindMode, setColorblindMode: setColorblindModeWithStorage }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;