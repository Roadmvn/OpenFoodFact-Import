import React from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Text, Appbar } from 'react-native-paper';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store';

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    if (loading) return;
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
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Tableau de bord" />
        <Appbar.Action 
          icon="logout" 
          onPress={handleLogout}
          color="#fff"
        />
      </Appbar.Header>

      <View style={styles.content}>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>
              Bienvenue, {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.roleText}>Rôle : {user.role}</Text>
          </View>
        )}

        <View style={styles.mainContent}>
          {/* Contenu du tableau de bord */}
          <Text>Contenu du tableau de bord à venir...</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Déconnexion...' : 'Se déconnecter'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    elevation: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 5,
  },
  roleText: {
    fontSize: 16,
    color: '#666',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ff4444',
  },
});

export default DashboardScreen;
