import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, StatusBar, TouchableOpacity, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Text, Appbar, FAB, Avatar, IconButton } from 'react-native-paper';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store/index';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { ProductStorageService } from '../../services/products/ProductStorageService';

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);
  const { theme, colorBlindMode } = useTheme();
  const [scannedCount, setScannedCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  
  // Log pour déboguer le thème
  useEffect(() => {
    console.log('DashboardScreen - Mode daltonien actif:', colorBlindMode);
    console.log('DashboardScreen - Couleur primaire actuelle:', theme.primary);
    console.log('DashboardScreen - Couleur d\'accent actuelle:', theme.accent);
    
    // Charger les compteurs au démarrage
    loadCounters();
  }, [colorBlindMode, theme]);
  
  // Recharger les compteurs quand l'écran est de nouveau affiché
  useFocusEffect(
    React.useCallback(() => {
      console.log('DashboardScreen - Écran affiché, actualisation des compteurs');
      loadCounters();
      return () => {
        // Nettoyage si nécessaire quand l'écran perd le focus
      };
    }, [])
  );

  // Fonction pour charger les compteurs
  const loadCounters = async () => {
    try {
      const counters = await ProductStorageService.getCounters();
      setScannedCount(counters.scannedCount);
      setFavoritesCount(counters.favoritesCount);
    } catch (error) {
      console.error('Erreur lors du chargement des compteurs:', error);
    }
  };

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

  const handleNativeScanPress = () => {
    // Navigation vers l'écran de scan natif
    navigation.navigate('NativeScan' as never);
  };

  const handleExpoScanPress = () => {
    // Navigation vers l'écran de scan Expo
    navigation.navigate('ExpoScan' as never);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  const handleAccessibilityPress = () => {
    navigation.navigate('Accessibility' as never);
  };

  const handleOrderHistoryPress = () => {
    navigation.navigate('OrderHistory' as never);
  };

  const handleScannedProductsPress = () => {
    navigation.navigate('ScannedProducts' as never);
  };

  const handleFavoritesPress = () => {
    navigation.navigate('FavoriteProducts' as never);
  };

  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    if (!user) return '';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || user.username.substring(0, 2).toUpperCase();
  };

  // Vérifier si nous sommes dans Expo Go
  const isInExpoGo = () => {
    return !__DEV__ || process.env.EXPO_ENVIRONMENT === 'expo';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={theme.headerBackground} barStyle="light-content" />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header amélioré avec des boutons plus distincts */}
        <View style={[styles.headerContainer, { backgroundColor: theme.headerBackground }]}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Text style={[styles.titleText, { color: theme.headerText }]}>Trinity</Text>
              <Text style={[styles.subtitleText, { color: theme.headerText }]}>Dashboard</Text>
            </View>
            
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={handleProfilePress}
                accessibilityLabel="Profil"
                accessibilityHint="Accéder à votre profil utilisateur"
              >
                <LinearGradient
                  colors={theme.accentGradient}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <IconButton icon="account" color="#FFFFFF" size={24} />
                </LinearGradient>
                <Text style={[styles.buttonLabel, { color: theme.text }]}>Profil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => navigation.navigate('Accessibility' as never)}
                accessibilityLabel="Paramètres d'accessibilité"
                accessibilityHint="Ouvrir les paramètres d'accessibilité"
              >
                <LinearGradient
                  colors={theme.accentGradient}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <IconButton icon="eye-settings" color="#FFFFFF" size={24} />
                </LinearGradient>
                <Text style={[styles.buttonLabel, { color: theme.text }]}>Accessibilité</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={handleOrderHistoryPress}
                accessibilityLabel="Historique des commandes"
                accessibilityHint="Voir l'historique de vos commandes"
              >
                <LinearGradient
                  colors={theme.accentGradient}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <IconButton icon="history" color="#FFFFFF" size={24} />
                </LinearGradient>
                <Text style={[styles.buttonLabel, { color: theme.text }]}>Commandes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={handleLogout}
                accessibilityLabel="Déconnexion"
                accessibilityHint="Se déconnecter de l'application"
              >
                <LinearGradient
                  colors={theme.accentGradient}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <IconButton icon="logout" color="#FFFFFF" size={24} />
                </LinearGradient>
                <Text style={[styles.buttonLabel, { color: theme.text }]}>Déconnexion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {user ? (
            <Animatable.View 
              animation="fadeIn" 
              duration={800} 
              style={[styles.userInfoContainer, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={styles.userHeaderContainer}>
                <LinearGradient
                  colors={theme.cardGradient}
                  style={styles.avatarContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Avatar.Text 
                    size={60} 
                    label={getUserInitials()} 
                    style={styles.avatar}
                    color="#FFFFFF"
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                </LinearGradient>
                <View style={styles.userTextContainer}>
                  <Text style={[styles.welcomeText, { color: theme.text }]}>Bienvenue, {user.username}</Text>
                  <Text style={[styles.emailText, { color: theme.textSecondary }]}>{user.email}</Text>
                </View>
              </View>

              <Animatable.View 
                animation="fadeInUp" 
                duration={800} 
                delay={300}
                style={styles.statsContainer}
              >
                <Animatable.View 
                  animation="zoomIn" 
                  duration={800} 
                  delay={500}
                  style={[styles.statBox, { backgroundColor: theme.background }]}
                >
                  <TouchableOpacity 
                    style={styles.statTouchable}
                    onPress={handleScannedProductsPress}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={theme.cardGradient}
                      style={styles.statCircle}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.statNumber}>{scannedCount}</Text>
                    </LinearGradient>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Produits scannés</Text>
                  </TouchableOpacity>
                </Animatable.View>
                
                <Animatable.View 
                  animation="zoomIn" 
                  duration={800} 
                  delay={700}
                  style={[styles.statBox, { backgroundColor: theme.background }]}
                >
                  <TouchableOpacity 
                    style={styles.statTouchable}
                    onPress={handleFavoritesPress}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={theme.cardGradient}
                      style={styles.statCircle}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.statNumber}>{favoritesCount}</Text>
                    </LinearGradient>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Favoris</Text>
                  </TouchableOpacity>
                </Animatable.View>
              </Animatable.View>
            </Animatable.View>
          ) : (
            <Text style={[styles.errorText, { color: theme.error }]}>Utilisateur non connecté</Text>
          )}
        </View>

        <View style={styles.scanButtonsContainer}>
          <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite">
            <TouchableOpacity
              style={styles.fabContainer}
              onPress={handleScanPress}
              accessibilityLabel="Scanner un produit"
              accessibilityHint="Ouvrir la caméra pour scanner un code-barres"
            >
              <LinearGradient
                colors={theme.accentGradient}
                style={styles.fab}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <IconButton icon="barcode-scan" color="#FFFFFF" size={30} />
              </LinearGradient>
              <Text style={styles.fabLabel}>Scanner</Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* N'afficher ce bouton que si nous ne sommes pas dans Expo Go */}
          {!isInExpoGo() && (
            <Animatable.View animation="pulse" delay={300} easing="ease-out" iterationCount="infinite">
              <TouchableOpacity
                style={styles.fabContainer}
                onPress={handleNativeScanPress}
                accessibilityLabel="Scanner natif un produit"
                accessibilityHint="Ouvrir le scanner natif de la caméra"
              >
                <LinearGradient
                  colors={theme.accentGradient}
                  style={styles.fab}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <IconButton icon="camera" color="#FFFFFF" size={30} />
                </LinearGradient>
                <Text style={styles.fabLabel}>Scanner Natif</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}

          <Animatable.View animation="pulse" delay={600} easing="ease-out" iterationCount="infinite">
            <TouchableOpacity
              style={styles.fabContainer}
              onPress={handleExpoScanPress}
              accessibilityLabel="Scanner Expo un produit"
              accessibilityHint="Ouvrir le scanner Expo compatible avec Expo Go"
            >
              <LinearGradient
                colors={theme.accentGradient}
                style={styles.fab}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <IconButton icon="qrcode-scan" color="#FFFFFF" size={30} />
              </LinearGradient>
              <Text style={styles.fabLabel}>Scanner Expo</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingBottom: 10,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  titleContainer: {
    marginBottom: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitleText: {
    fontSize: 16,
    opacity: 0.8,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerButton: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonGradient: {
    borderRadius: 20,
    padding: 2,
  },
  buttonLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfoContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  userHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    borderRadius: 30,
    padding: 3,
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  userTextContainer: {
    marginLeft: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emailText: {
    fontSize: 14,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    width: '45%',
  },
  statCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  scanButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  fabContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statTouchable: {
    alignItems: 'center',
    width: '100%',
  },
});