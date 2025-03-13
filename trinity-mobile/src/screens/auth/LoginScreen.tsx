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

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { theme, isColorblindMode } = useTheme();

  // Log pour déboguer le thème
  useEffect(() => {
    console.log('LoginScreen - Mode daltonien actif:', isColorblindMode);
    console.log('LoginScreen - Couleur primaire actuelle:', theme.primary);
    console.log('LoginScreen - Couleur d\'accent actuelle:', theme.accent);
  }, [isColorblindMode, theme]);

  const handleLogin = () => {
    if (!email || !password) {
      return;
    }
    dispatch(loginRequest({ email, password }));
  };

  const handleAccessibilityPress = () => {
    navigation.navigate('Accessibility');
  };

  // Déterminer la couleur du bouton de connexion en fonction du mode
  const loginButtonColor = isColorblindMode ? theme.accent : '#0D8AF0';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity 
        style={styles.accessibilityButton} 
        onPress={handleAccessibilityPress}
        accessibilityLabel="Paramètres d'accessibilité"
      >
        <Ionicons name="eye-outline" size={24} color={theme.secondary} />
        <Text style={[styles.accessibilityText, { color: theme.secondary }]}>Accessibilité</Text>
      </TouchableOpacity>

      <View style={styles.form}>
        <Text style={[styles.title, { color: '#000000' }]}>Connexion</Text>
        
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
          style={[styles.button, { backgroundColor: loginButtonColor }, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
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
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
