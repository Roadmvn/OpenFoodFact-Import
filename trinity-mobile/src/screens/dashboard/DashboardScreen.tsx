import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Text, Appbar, FAB } from 'react-native-paper';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store/index';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);
  const { theme, isColorblindMode } = useTheme();
  
  // Log pour déboguer le thème
  useEffect(() => {
    console.log('DashboardScreen - Mode daltonien actif:', isColorblindMode);
    console.log('DashboardScreen - Couleur primaire actuelle:', theme.primary);
    console.log('DashboardScreen - Couleur d\'accent actuelle:', theme.accent);
  }, [isColorblindMode, theme]);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          onPress: () => {
            dispatch(logout());
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleScanPress = () => {
    // Navigation vers l'écran de scan
    navigation.navigate('Scan' as never);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  const handleAccessibilityPress = () => {
    navigation.navigate('Accessibility' as never);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Appbar.Header style={[styles.header, { backgroundColor: theme.primary }]}>
        <Appbar.Content 
          title="Trinity" 
          subtitle="Dashboard" 
          titleStyle={{ color: '#FFFFFF' }}
          subtitleStyle={{ color: '#FFFFFF' }}
        />
        <Appbar.Action icon="account" onPress={handleProfilePress} color="#FFFFFF" />
        <Appbar.Action icon="eye" onPress={handleAccessibilityPress} color="#FFFFFF" />
        <Appbar.Action icon="logout" onPress={handleLogout} color="#FFFFFF" />
      </Appbar.Header>

      <View style={styles.content}>
        {user ? (
          <View style={[styles.userInfoContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.welcomeText, { color: theme.text }]}>Bienvenue, {user.username}</Text>
            <Text style={[styles.emailText, { color: theme.textSecondary }]}>{user.email}</Text>

            <View style={styles.statsContainer}>
              <View style={[styles.statBox, { backgroundColor: theme.background }]}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Produits scannés</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.background }]}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Favoris</Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={[styles.errorText, { color: theme.error }]}>Utilisateur non connecté</Text>
        )}
      </View>

      <FAB
        style={[styles.fab, { backgroundColor: theme.accent }]}
        icon="barcode-scan"
        onPress={handleScanPress}
        color="#FFFFFF"
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfoContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});