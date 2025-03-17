import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleAccessibilityPress = () => {
    navigation.navigate('Accessibility');
  };

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
            colors={theme.buttonGradient}
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
});
