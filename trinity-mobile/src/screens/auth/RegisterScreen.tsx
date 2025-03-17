import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerRequest } from '../../store/slices/authSlice';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootState } from '../../store';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  
  const dispatch = useDispatch();
  const { loading, error, registerSuccess } = useSelector((state: RootState) => state.auth);

  const handleRegister = () => {
    if (!firstName || !lastName || !email || !password) {
      return; // Ne pas envoyer si les champs obligatoires sont vides
    }
    
    dispatch(registerRequest({
      firstName,
      lastName,
      email,
      password,
      phone,
      address: {
        street,
        postalCode,
        city,
        country
      }
    }));
  };

  useEffect(() => {
    if (registerSuccess) {
      // Attendre que le message de succès soit affiché avant de rediriger
      const timer = setTimeout(() => {
        navigation.navigate('Login');
      }, 2000); // 2 secondes, correspondant à la durée du toast
      return () => clearTimeout(timer);
    }
  }, [registerSuccess, navigation]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <TextInput
        style={styles.input}
        placeholder="Prénom *"
        value={firstName}
        onChangeText={setFirstName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Nom *"
        value={lastName}
        onChangeText={setLastName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email *"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe *"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Téléphone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Rue"
        value={street}
        onChangeText={setStreet}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Code postal"
        value={postalCode}
        onChangeText={setPostalCode}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Ville"
        value={city}
        onChangeText={setCity}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Pays"
        value={country}
        onChangeText={setCountry}
      />
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 15,
    padding: 10,
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
});
