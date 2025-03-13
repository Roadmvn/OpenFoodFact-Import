import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Platform, ScrollView, TouchableOpacity, Alert, Animated, Dimensions, StatusBar, SafeAreaView } from 'react-native';
import { Appbar, TextInput, Button, Avatar, Card, Divider, ActivityIndicator, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateProfileRequest } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const { theme, colorBlindMode } = useTheme();
  
  // États pour les champs modifiables
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;
  
  // Utiliser les couleurs du thème au lieu de définir des couleurs personnalisées
  const headerBackground = theme.primary;
  
  // Mettre à jour les états lorsque l'utilisateur change
  useEffect(() => {
    if (user) {
      console.log('ProfileScreen: User data received', user);
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
  }, [user]);
  
  // Animation d'entrée
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };
  
  // Fonction pour basculer en mode édition
  const toggleEditMode = () => {
    console.log('ProfileScreen: Toggling edit mode', !isEditing);
    setIsEditing(!isEditing);
  };
  
  // Fonction pour sauvegarder les modifications
  const saveChanges = () => {
    const updatedProfile = {
      firstName,
      lastName,
      phone,
    };
    
    console.log('ProfileScreen: Saving profile changes', updatedProfile);
    dispatch(updateProfileRequest(updatedProfile));
    setIsEditing(false);
  };
  
  // Fonction pour annuler les modifications
  const cancelChanges = () => {
    console.log('ProfileScreen: Cancelling profile changes');
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
    setIsEditing(false);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={headerBackground} barStyle="light-content" />
      <View style={styles.container}>
        {/* Header fixe en haut avec plus d'espace */}
        <View style={[styles.headerContainer, { backgroundColor: headerBackground }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
              accessibilityLabel="Retour"
              accessibilityHint="Retourne à l'écran précédent"
            >
              <IconButton icon="arrow-left" color="#FFFFFF" size={24} />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Mon Profil</Text>
            
            {!isEditing && (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={toggleEditMode}
                accessibilityLabel="Modifier le profil"
                accessibilityHint="Active le mode d'édition du profil"
              >
                <IconButton icon="pencil" color="#FFFFFF" size={24} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : (
          <Animated.ScrollView 
            style={[styles.scrollView, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {error && (
              <Animatable.View animation="shake" duration={1000}>
                <Text style={styles.errorText}>{error}</Text>
              </Animatable.View>
            )}
            
            {/* En-tête de profil */}
            <Animatable.View 
              animation="fadeIn" 
              duration={1200} 
              delay={300}
              style={styles.profileHeader}
            >
              <LinearGradient
                colors={theme.cardGradient}
                style={styles.avatarContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Avatar.Text 
                  size={80} 
                  label={getUserInitials()} 
                  style={styles.avatar}
                  color="#FFFFFF"
                  labelStyle={{ fontWeight: 'bold' }}
                />
              </LinearGradient>
              <Animatable.Text 
                animation="fadeInUp" 
                duration={800} 
                delay={500}
                style={styles.fullName}
              >
                {`${firstName} ${lastName}`}
              </Animatable.Text>
              <Animatable.Text 
                animation="fadeInUp" 
                duration={800} 
                delay={700}
                style={styles.email}
              >
                {user?.email}
              </Animatable.Text>
            </Animatable.View>
            
            {/* Section Informations personnelles */}
            <Animatable.View 
              animation="fadeInUp" 
              duration={800} 
              delay={900}
            >
              <Card style={styles.card} elevation={3}>
                <Card.Title 
                  title="Informations personnelles" 
                  titleStyle={styles.cardTitle}
                  left={(props) => <IconButton {...props} icon="account" color={theme.primary} />}
                />
                <Card.Content>
                  {isEditing ? (
                    <>
                      <Animatable.View animation="fadeIn" duration={500}>
                        <TextInput
                          label="Prénom"
                          value={firstName}
                          onChangeText={setFirstName}
                          style={styles.input}
                          mode="outlined"
                          outlineColor={theme.border}
                          activeOutlineColor={theme.primary}
                          disabled={loading}
                          accessibilityLabel="Prénom"
                          accessibilityHint="Entrez votre prénom"
                        />
                      </Animatable.View>
                      
                      <Animatable.View animation="fadeIn" duration={500} delay={100}>
                        <TextInput
                          label="Nom"
                          value={lastName}
                          onChangeText={setLastName}
                          style={styles.input}
                          mode="outlined"
                          outlineColor={theme.border}
                          activeOutlineColor={theme.primary}
                          disabled={loading}
                          accessibilityLabel="Nom"
                          accessibilityHint="Entrez votre nom"
                        />
                      </Animatable.View>
                      
                      <Animatable.View animation="fadeIn" duration={500} delay={200}>
                        <TextInput
                          label="Téléphone"
                          value={phone}
                          onChangeText={setPhone}
                          style={styles.input}
                          mode="outlined"
                          outlineColor={theme.border}
                          activeOutlineColor={theme.primary}
                          keyboardType="phone-pad"
                          disabled={loading}
                          accessibilityLabel="Téléphone"
                          accessibilityHint="Entrez votre numéro de téléphone"
                        />
                      </Animatable.View>
                    </>
                  ) : (
                    <>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Prénom:</Text>
                        <Text style={styles.infoValue}>{firstName}</Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nom:</Text>
                        <Text style={styles.infoValue}>{lastName}</Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Téléphone:</Text>
                        <Text style={styles.infoValue}>{phone || 'Non renseigné'}</Text>
                      </View>
                    </>
                  )}
                </Card.Content>
              </Card>
            </Animatable.View>
            
            {/* Section Statistiques */}
            <Animatable.View 
              animation="fadeInUp" 
              duration={800} 
              delay={1300}
            >
              <Card style={styles.card} elevation={3}>
                <Card.Title 
                  title="Statistiques" 
                  titleStyle={styles.cardTitle}
                  left={(props) => <IconButton {...props} icon="chart-bar" color={theme.primary} />}
                />
                <Card.Content>
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <LinearGradient
                        colors={theme.cardGradient}
                        style={styles.statCircle}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.statValue}>0</Text>
                      </LinearGradient>
                      <Text style={styles.statLabel}>Produits scannés</Text>
                    </View>
                    
                    <View style={styles.statItem}>
                      <LinearGradient
                        colors={theme.cardGradient}
                        style={styles.statCircle}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.statValue}>0</Text>
                      </LinearGradient>
                      <Text style={styles.statLabel}>Favoris</Text>
                    </View>
                  </View>
                  
                  <Animatable.View 
                    animation="fadeInUp" 
                    duration={800} 
                    delay={1700}
                  >
                    <TouchableOpacity 
                      style={styles.historyButton}
                      onPress={() => navigation.navigate('PurchaseHistory' as never)}
                      activeOpacity={0.8}
                      accessibilityLabel="Voir l'historique des achats"
                      accessibilityHint="Navigue vers l'écran d'historique des achats"
                    >
                      <LinearGradient
                        colors={theme.buttonGradient}
                        style={styles.historyButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.historyButtonText}>Voir l'historique des achats</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animatable.View>
                </Card.Content>
              </Card>
            </Animatable.View>
            
            {/* Boutons d'action en mode édition */}
            {isEditing && (
              <Animatable.View 
                animation="fadeInUp" 
                duration={500}
                style={styles.actionButtons}
              >
                <TouchableOpacity
                  onPress={cancelChanges}
                  style={[styles.actionButton, styles.cancelButton, { borderColor: theme.cancelButtonBorder }]}
                  activeOpacity={0.7}
                  accessibilityLabel="Annuler les modifications"
                  accessibilityHint="Annule les modifications et quitte le mode d'édition"
                >
                  <LinearGradient
                    colors={['#ffffff', '#f5f5f5']}
                    style={[styles.buttonGradient, styles.cancelButtonGradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={[styles.buttonText, { color: theme.cancelButtonText }]}>Annuler</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={saveChanges}
                  style={[styles.actionButton, styles.saveButton]}
                  activeOpacity={0.7}
                  disabled={loading}
                  accessibilityLabel="Enregistrer les modifications"
                  accessibilityHint="Sauvegarde les modifications du profil"
                >
                  <LinearGradient
                    colors={theme.buttonGradient}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.buttonText, { color: theme.buttonText }]}>Enregistrer</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>
            )}
            
            {/* Espace supplémentaire en bas pour éviter que le contenu soit caché */}
            <View style={styles.bottomPadding} />
          </Animated.ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 56,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 5,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  avatarContainer: {
    borderRadius: 50,
    padding: 5,
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2A2E45',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  card: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#2A2E45',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#2A2E45',
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: '#e0e0e0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  historyButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  historyButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cancelButton: {
    marginRight: 8,
    borderWidth: 2,
  },
  cancelButtonGradient: {
    borderColor: 'transparent',
  },
  saveButton: {
    marginLeft: 8,
  },
  bottomPadding: {
    height: 30,
  },
});

export default ProfileScreen;