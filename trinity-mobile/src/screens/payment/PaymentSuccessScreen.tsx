import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  BackHandler,
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
  
  // Empêcher le retour en arrière avec le bouton physique
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('Dashboard');
      return true;
    });
    
    return () => backHandler.remove();
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
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Animation de succès */}
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../../assets/animations/payment-success.json')}
            autoPlay
            loop={false}
            style={styles.animation}
          />
        </View>
        
        {/* Message de succès */}
        <View style={styles.successMessageContainer}>
          <Text style={[styles.successTitle, { color: theme.text }]}>
            Paiement réussi !
          </Text>
          <Text style={[styles.successMessage, { color: theme.textSecondary }]}>
            Votre commande a été traitée avec succès. Merci pour votre achat !
          </Text>
        </View>
        
        {/* Détails de la commande */}
        <View style={[styles.orderDetailsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.orderDetailsTitle, { color: theme.text }]}>
            Détails de la commande
          </Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Numéro de commande:
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {formatOrderNumber(orderId)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Date:
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {formatDate()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Méthode de paiement:
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              PayPal
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              ID Transaction PayPal:
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {paypalOrderId}
            </Text>
          </View>
          
          <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>
              Montant total:
            </Text>
            <Text style={[styles.totalValue, { color: theme.accent }]}>
              {totalAmount.toFixed(2)} €
            </Text>
          </View>
        </View>
        
        {/* Boutons d'action */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.accent }]}
            onPress={() => navigation.navigate('Orders')}
          >
            <Ionicons name="list" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Voir mes commandes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.accent }]}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Ionicons name="home" size={20} color={theme.accent} style={styles.buttonIcon} />
            <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>
              Retour à l'accueil
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  orderDetailsCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentSuccessScreen;
