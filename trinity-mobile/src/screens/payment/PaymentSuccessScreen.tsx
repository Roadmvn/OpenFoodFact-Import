import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  BackHandler,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import LottieView from 'lottie-react-native';

// Type pour les paramètres de navigation
type PaymentSuccessScreenRouteProp = RouteProp<{
  PaymentSuccess: {
    orderId: string;
    paypalOrderId: string;
    totalAmount: number;
  };
}, 'PaymentSuccess'>;

type PaymentSuccessScreenNavigationProp = StackNavigationProp<{
  Dashboard: undefined;
  Orders: undefined;
}>;

const PaymentSuccessScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<PaymentSuccessScreenNavigationProp>();
  const route = useRoute<PaymentSuccessScreenRouteProp>();
  const { orderId, paypalOrderId, totalAmount } = route.params;
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Log pour le débogage
  useEffect(() => {
    console.log('[PaymentSuccessScreen] INFO: Initialisation de l\'écran de confirmation');
    console.log('[PaymentSuccessScreen] INFO: Paramètres reçus', { orderId, paypalOrderId, totalAmount });
  }, [orderId, paypalOrderId, totalAmount]);
  
  // Animations au chargement
  useEffect(() => {
    console.log('[PaymentSuccessScreen] INFO: Démarrage des animations');
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);
  
  // Empêcher le retour en arrière avec le bouton physique
  useEffect(() => {
    console.log('[PaymentSuccessScreen] INFO: Configuration du gestionnaire de bouton retour');
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('[PaymentSuccessScreen] INFO: Tentative de retour arrière interceptée, redirection vers Dashboard');
      navigation.navigate('Dashboard');
      return true;
    });
    
    return () => {
      console.log('[PaymentSuccessScreen] INFO: Nettoyage du gestionnaire de bouton retour');
      backHandler.remove();
    }
  }, [navigation]);
  
  // Générer un numéro de commande lisible
  const formatOrderNumber = (id: string) => {
    // Prendre les 8 premiers caractères ou ajouter des zéros si nécessaire
    const baseNumber = id.toString().padStart(8, '0').substring(0, 8);
    return `TM-${baseNumber}`;
  };
  
  // Formater la date actuelle
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date().toLocaleDateString('fr-FR', options);
  };
  
  // Gérer le retour à l'accueil
  const handleGoHome = () => {
    console.log('[PaymentSuccessScreen] INFO: Retour à l\'accueil');
    navigation.navigate('Dashboard');
  };
  
  // Gérer la navigation vers les commandes
  const handleViewOrders = () => {
    console.log('[PaymentSuccessScreen] INFO: Navigation vers l\'écran des commandes');
    navigation.navigate('Orders');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      {/* Header avec titre */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.headerTitle, { color: '#fff' }]}>
          Confirmation
        </Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animation de succès */}
        <Animated.View 
          style={[
            styles.animationContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <LottieView
            source={require('../../../assets/animations/payment-success.json')}
            autoPlay
            loop={false}
            style={styles.animation}
          />
        </Animated.View>
        
        {/* Message de succès */}
        <Animated.View 
          style={[
            styles.successMessageContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[
            styles.successTitle, 
            { 
              color: theme.text,
              fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
            }
          ]}>
            Paiement réussi !
          </Text>
          <Text style={[
            styles.successMessage, 
            { 
              color: theme.textSecondary,
              fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
            }
          ]}>
            Votre commande a été traitée avec succès. Merci pour votre achat !
          </Text>
        </Animated.View>
        
        {/* Détails de la commande */}
        <Animated.View 
          style={[
            styles.orderDetailsCard, 
            { 
              backgroundColor: theme.card,
              shadowColor: theme.dark ? '#000' : '#888',
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Text style={[
            styles.orderDetailsTitle, 
            { 
              color: theme.text,
              fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
            }
          ]}>
            Détails de la commande
          </Text>
          
          <View style={styles.detailRow}>
            <Text style={[
              styles.detailLabel, 
              { 
                color: theme.textSecondary,
                fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
              }
            ]}>
              Numéro de commande:
            </Text>
            <Text style={[
              styles.detailValue, 
              { 
                color: theme.text,
                fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
              }
            ]}>
              {formatOrderNumber(orderId)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[
              styles.detailLabel, 
              { 
                color: theme.textSecondary,
                fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
              }
            ]}>
              Date:
            </Text>
            <Text style={[
              styles.detailValue, 
              { 
                color: theme.text,
                fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
              }
            ]}>
              {formatDate()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[
              styles.detailLabel, 
              { 
                color: theme.textSecondary,
                fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
              }
            ]}>
              Méthode de paiement:
            </Text>
            <Text style={[
              styles.detailValue, 
              { 
                color: theme.text,
                fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
              }
            ]}>
              PayPal
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[
              styles.detailLabel, 
              { 
                color: theme.textSecondary,
                fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
              }
            ]}>
              ID Transaction PayPal:
            </Text>
            <Text style={[
              styles.detailValue, 
              { 
                color: theme.text,
                fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
              }
            ]}>
              {paypalOrderId}
            </Text>
          </View>
          
          <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
            <Text style={[
              styles.totalLabel, 
              { 
                color: theme.text,
                fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
              }
            ]}>
              Montant total:
            </Text>
            <Text style={[
              styles.totalValue, 
              { 
                color: theme.accent,
                fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
              }
            ]}>
              {totalAmount.toFixed(2)} €
            </Text>
          </View>
        </Animated.View>
        
        {/* Boutons d'action */}
        <Animated.View 
          style={[
            styles.actionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.accent }]}
            onPress={handleViewOrders}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={[
              styles.primaryButtonText,
              {
                fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
              }
            ]}>
              Voir mes commandes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.accent }]}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Ionicons name="home" size={22} color={theme.accent} style={styles.buttonIcon} />
            <Text style={[
              styles.secondaryButtonText, 
              { 
                color: theme.accent,
                fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
              }
            ]}>
              Retour à l'accueil
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  successMessageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  orderDetailsCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  orderDetailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 15,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  actionsContainer: {
    marginTop: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  buttonIcon: {
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default PaymentSuccessScreen;
