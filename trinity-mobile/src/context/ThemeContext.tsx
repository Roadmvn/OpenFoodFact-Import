// src/context/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clé pour stocker le mode daltonien dans AsyncStorage
const COLORBLIND_MODE_KEY = 'colorblind_mode';

// Définition des couleurs pour les deux thèmes
export const themes = {
  standard: {
    primary: '#1E88E5', // Bleu clair pour toute l'interface
    secondary: '#1976D2', // Bleu légèrement plus foncé pour les éléments secondaires
    accent: '#4CAF50',
    background: '#f5f5f5',
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#FF5252',
  },
  colorblind: {
    // Palette adaptée pour les daltoniens (protanopie, deutéranopie)
    primary: '#0A3B5C', // Bleu foncé au lieu de bleu-violet
    secondary: '#3B5998', // Bleu plus visible
    accent: '#F57C00', // Orange au lieu de vert
    background: '#f5f5f5',
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#D32F2F', // Rouge plus foncé
  },
};

// Type pour les thèmes
export type ThemeType = typeof themes.standard;

// Interface pour le contexte
interface ThemeContextType {
  theme: ThemeType;
  isColorblindMode: boolean;
  toggleColorblindMode: () => void;
  setColorblindMode: (value: boolean) => void;
}

// Création du contexte avec une valeur par défaut
const ThemeContext = createContext<ThemeContextType>({
  theme: themes.standard,
  isColorblindMode: false,
  toggleColorblindMode: () => {},
  setColorblindMode: () => {},
});

// Hook personnalisé pour utiliser le contexte
export const useTheme = () => useContext(ThemeContext);

// Provider du thème
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialiser avec le mode standard (false) par défaut
  const [isColorblindMode, setIsColorblindMode] = useState(false);
  const theme = isColorblindMode ? themes.colorblind : themes.standard;

  // Fonction pour définir directement le mode daltonien avec mise à jour du state et stockage
  const setColorblindModeWithStorage = async (value: boolean) => {
    try {
      console.log('ThemeContext - Définition directe du mode daltonien:', value);
      setIsColorblindMode(value);
      await AsyncStorage.setItem(COLORBLIND_MODE_KEY, value.toString());
      console.log('ThemeContext - Mode daltonien sauvegardé:', value);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode daltonien:', error);
    }
  };

  // Charger le mode daltonien depuis AsyncStorage au démarrage
  useEffect(() => {
    const loadColorblindMode = async () => {
      try {
        console.log('ThemeContext - Chargement des préférences...');
        
        // Forcer le mode standard au démarrage
        await setColorblindModeWithStorage(false);
        
        // Ensuite, vérifier s'il y a une préférence enregistrée
        const savedMode = await AsyncStorage.getItem(COLORBLIND_MODE_KEY);
        console.log('ThemeContext - Mode daltonien chargé depuis AsyncStorage:', savedMode);
        
        if (savedMode !== null) {
          const colorblindEnabled = savedMode === 'true';
          console.log('ThemeContext - Mode daltonien activé:', colorblindEnabled);
          setIsColorblindMode(colorblindEnabled);
        } else {
          // Si aucune valeur n'est stockée, définir explicitement sur false
          console.log('ThemeContext - Aucune préférence trouvée, mode standard activé par défaut');
          await AsyncStorage.setItem(COLORBLIND_MODE_KEY, 'false');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du mode daltonien:', error);
        // En cas d'erreur, s'assurer que le mode standard est activé
        setIsColorblindMode(false);
      }
    };

    loadColorblindMode();
  }, []);

  // Fonction pour basculer le mode daltonien
  const toggleColorblindMode = async () => {
    try {
      const newMode = !isColorblindMode;
      console.log('ThemeContext - Changement du mode daltonien:', newMode);
      setIsColorblindMode(newMode);
      await AsyncStorage.setItem(COLORBLIND_MODE_KEY, newMode.toString());
      console.log('ThemeContext - Mode daltonien sauvegardé:', newMode);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode daltonien:', error);
    }
  };

  // Log à chaque rendu pour vérifier le thème actuel
  console.log('ThemeContext - Thème actuel:', isColorblindMode ? 'daltonien' : 'standard');
  console.log('ThemeContext - Couleur primaire:', theme.primary);
  console.log('ThemeContext - Couleur d\'accent:', theme.accent);

  return (
    <ThemeContext.Provider value={{ theme, isColorblindMode, toggleColorblindMode, setColorblindMode: setColorblindModeWithStorage }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;