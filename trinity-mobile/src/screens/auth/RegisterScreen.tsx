import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerRequest } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { useToast } from '../../contexts/ToastContext';
import { RegisterCredentials } from '../../store/types/auth';
import { AuthStackScreenProps } from '../../navigation/types/navigation';

type Props = AuthStackScreenProps<'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [formData, setFormData] = useState<RegisterCredentials>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    zipCode: '',
    city: '',
    country: '',
  });

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => ({
    loading: state.auth.loading,
    error: state.auth.error
  }));
  const { showToast } = useToast();

  // Refs pour la navigation entre les champs
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const zipCodeRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const countryRef = useRef<TextInput>(null);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  const validateForm = () => {
    if (Object.values(formData).some(value => !value)) {
      showToast('Veuillez remplir tous les champs', 'error');
      return false;
    }

    if (!formData.email.includes('@')) {
      showToast('Email invalide', 'error');
      return false;
    }

    if (formData.password.length < 8) {
      showToast('Le mot de passe doit contenir au moins 8 caractères', 'error');
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      showToast('Numéro de téléphone invalide', 'error');
      return false;
    }

    if (!/^\d{5}$/.test(formData.zipCode)) {
      showToast('Code postal invalide', 'error');
      return false;
    }

    return true;
  };

  const handleRegister = () => {
    if (validateForm()) {
      dispatch(registerRequest(formData));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.form}>
            <Text style={styles.title}>Inscription</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
            <TextInput
              ref={lastNameRef}
              style={styles.input}
              placeholder="Nom"
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="Mot de passe (8 caractères minimum)"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
            <TextInput
              ref={phoneRef}
              style={styles.input}
              placeholder="Téléphone"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              returnKeyType="next"
              onSubmitEditing={() => addressRef.current?.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
            <TextInput
              ref={addressRef}
              style={styles.input}
              placeholder="Adresse"
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: text})}
              returnKeyType="next"
              onSubmitEditing={() => zipCodeRef.current?.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
            <TextInput
              ref={zipCodeRef}
              style={styles.input}
              placeholder="Code postal"
              keyboardType="numeric"
              value={formData.zipCode}
              onChangeText={(text) => setFormData({...formData, zipCode: text})}
              returnKeyType="next"
              onSubmitEditing={() => cityRef.current?.focus()}
              blurOnSubmit={false}
              editable={!loading}
              maxLength={5}
            />
            <TextInput
              ref={cityRef}
              style={styles.input}
              placeholder="Ville"
              value={formData.city}
              onChangeText={(text) => setFormData({...formData, city: text})}
              returnKeyType="next"
              onSubmitEditing={() => countryRef.current?.focus()}
              blurOnSubmit={false}
              editable={!loading}
            />
            <TextInput
              ref={countryRef}
              style={styles.input}
              placeholder="Pays"
              value={formData.country}
              onChangeText={(text) => setFormData({...formData, country: text})}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              editable={!loading}
            />

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>S'inscrire</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.linkText}>Déjà inscrit ? Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
