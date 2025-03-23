import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest, googleLoginRequest, googleLoginSuccess, googleLoginFailure } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import GoogleAuthService from '../../services/auth/googleAuthService';
import * as SecureStore from 'expo-secure-store';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { theme, colorBlindMode } = useTheme();

  // Log pour déboguer le thème
  useEffect(() => {
    console.log('LoginScreen - Mode daltonien actif:', colorBlindMode);
    console.log('LoginScreen - Couleur primaire actuelle:', theme.primary);
    console.log('LoginScreen - Couleur d\'accent actuelle:', theme.accent);
  }, [colorBlindMode, theme]);

  const handleLogin = () => {
    if (!email || !password) {
      return;
    }
    dispatch(loginRequest({ email, password }));
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      dispatch(googleLoginRequest());
      
      const userData = await GoogleAuthService.login();
      
      if (userData) {
        // Construire un objet de réponse similaire à celui attendu par googleLoginSuccess
        const response = {
          user: {
            id: userData.id.toString(),
            email: userData.email,
            firstName: userData.name?.split(' ')[0] || '',
            lastName: userData.name?.split(' ')[1] || '',
          },
          token: await SecureStore.getItemAsync('userToken') || '',
          message: 'Connexion Google réussie'
        };
        
        dispatch(googleLoginSuccess(response));
        // Redirection vers l'écran principal
        navigation.navigate('Main');
      } else {
        dispatch(googleLoginFailure('Échec de la connexion avec Google'));
      }
    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error);
      dispatch(googleLoginFailure('Erreur lors de la connexion avec Google'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAccessibilityPress = () => {
    navigation.navigate('Accessibility');
  };

  // Fonction pour obtenir les couleurs du dégradé en fonction du mode daltonien
  const getGradientColors = () => {
    if (colorBlindMode) {
      // Dégradé adapté pour les daltoniens (bleu à orange)
      return ['#0C7BDC', '#E66100'] as const;
    } else {
      // Dégradé bleu-vert comme dans les options visuelles
      return ['#4A90E2', '#4CAF50'] as const;
    }
  };

  // Fonction pour obtenir les styles du bouton Google en fonction du mode daltonien
  const getGoogleButtonStyles = () => {
    if (colorBlindMode) {
      return {
        borderColor: '#0C7BDC',
        textColor: '#0C7BDC'
      };
    } else {
      return {
        borderColor: '#dadce0',
        textColor: '#3c4043'
      };
    }
  };

  // Récupérer les styles pour le bouton Google
  const googleButtonStyles = getGoogleButtonStyles();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity 
        style={styles.accessibilityButton} 
        onPress={handleAccessibilityPress}
        accessibilityLabel="Paramètres d'accessibilité"
      >
        <Ionicons name="eye-outline" size={24} color={theme.primary} />
        <Text style={[styles.accessibilityText, { color: theme.primary }]}>Accessibilité</Text>
      </TouchableOpacity>

      <View style={styles.form}>
        <Text style={[styles.title, { color: theme.text }]}>Connexion</Text>
        
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Email"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Mot de passe"
          placeholderTextColor={theme.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        {error && <Text style={[styles.error, { color: theme.error }]}>{error}</Text>}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <LinearGradient
            colors={getGradientColors()}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Séparateur */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={[styles.separatorText, { color: theme.textSecondary }]}>OU</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Bouton Google */}
        <TouchableOpacity 
          style={[styles.googleButton, { borderColor: googleButtonStyles.borderColor }]} 
          onPress={handleGoogleLogin}
          disabled={googleLoading}
        >
          <View style={styles.googleButtonContent}>
            <Image 
              source={require('../../../assets/google-icon.png')} 
              style={styles.googleIcon}
              resizeMode="contain"
            />
            {googleLoading ? (
              <ActivityIndicator color="#4285F4" />
            ) : (
              <Text style={[styles.googleButtonText, { color: googleButtonStyles.textColor }]}>{googleLoading ? '' : 'Se connecter avec Google'}</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.link, { color: theme.secondary }]}>Pas encore inscrit ? Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  button: {
    height: 50,
    borderRadius: 8,
    marginTop: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    marginBottom: 10,
    textAlign: 'center',
  },
  link: {
    textAlign: 'center',
    marginTop: 15,
  },
  accessibilityButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  accessibilityText: {
    marginLeft: 5,
    fontWeight: '500',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  separatorText: {
    marginHorizontal: 10,
  },
  googleButton: {
    height: 50,
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 12,
  },
  googleIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.25,
  },
});
