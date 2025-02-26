import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    if (loading) return; // Évite les doubles clics
    try {
      dispatch(logout());
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Bienvenue {user?.firstName || 'Admin'}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            loading && styles.disabledButton,
            pressed && styles.pressedButton
          ]}
          onPress={handleLogout}
          disabled={loading}
          android_ripple={{ color: '#ff6666' }}
        >
          <Text style={styles.logoutButtonText}>
            {loading ? 'Déconnexion...' : 'Déconnecter'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.dashboardTitle}>Tableau de bord</Text>
      
      {/* Plus tard, nous ajouterons ici la liste des produits */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    elevation: 2,
  },
  pressedButton: {
    backgroundColor: '#ff6666',
    elevation: 1,
  },
  disabledButton: {
    opacity: 0.7,
    elevation: 0,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
