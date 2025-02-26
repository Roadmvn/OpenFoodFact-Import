import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import AuthService from '../../services/auth/authService';
import * as SecureStore from 'expo-secure-store';
import { RootState } from '../../store';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    try {
      console.log('Tentative de connexion...');
      dispatch(loginRequest({ email, password }));
      
      const result = await AuthService.login({ email, password });
      console.log('Résultat de la connexion:', result);
      
      if (result.token) {
        await SecureStore.setItemAsync('auth_token', result.token);
        console.log('Token stocké avec succès');
        dispatch(loginSuccess(result));
        // @ts-ignore
        navigation.replace('Home');
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      const errorMessage = error?.message || 'Une erreur est survenue';
      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Connexion</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  form: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});
