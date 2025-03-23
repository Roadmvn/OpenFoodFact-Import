import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
  Animated,
  Easing,
  Platform,
  SafeAreaView,
  BackHandler,
  Linking,
} from 'react-native';

// Système de logs pour le débogage
const LOG_TAG = 'PaymentScreen';
const logInfo = (message: string, data?: any) => {
  if (data) {
    console.log(`[${LOG_TAG}] INFO: ${message}`, data);
  } else {
    console.log(`[${LOG_TAG}] INFO: ${message}`);
  }
};

const logError = (message: string, error?: any) => {
  if (error) {
    console.error(`[${LOG_TAG}] ERROR: ${message}`, error);
  } else {
    console.error(`[${LOG_TAG}] ERROR: ${message}`);
  }
};

const logWarning = (message: string, data?: any) => {
  if (data) {
    console.warn(`[${LOG_TAG}] WARNING: ${message}`, data);
  } else {
    console.warn(`[${LOG_TAG}] WARNING: ${message}`);
  }
};

// Commenté temporairement pour éviter l'erreur
// import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import PaypalService, { CreateOrderResponse } from '../../services/payment/paypalService';
import CartService, { CartItem } from '../../services/cart/cartService';

// Type pour les paramètres de navigation
type PaymentScreenRouteProp = RouteProp<{
  Payment: {
    cartItems: CartItem[];
    totalAmount: number;
  }
}, 'Payment'>;

// Type pour la navigation
type PaymentScreenNavigationProp = StackNavigationProp<{
  PaymentSuccess: {
    orderId: string;
    paypalOrderId: string;
    totalAmount: number;
  };
  Cart: undefined;
}>;

const PaymentScreen = () => {
  logInfo("Initialisation de l'écran de paiement");
  
  const { theme, colorBlindMode } = useTheme();
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { cartItems, totalAmount } = route.params;
  const { user } = useAuth();
  
  // Log pour déboguer le thème
  useEffect(() => {
    console.log('PaymentScreen - Mode daltonien actif:', colorBlindMode);
    console.log('PaymentScreen - Couleur primaire actuelle:', theme.primary);
    console.log('PaymentScreen - Couleur d\'accent actuelle:', theme.accent);
  }, [colorBlindMode, theme]);
  
  logInfo("Paramètres reçus", { 
    cartItemsCount: cartItems.length, 
    totalAmount: totalAmount,
    userId: user?.id  // Utiliser l'ID réel de l'utilisateur connecté
  });
  
  const [loading, setLoading] = useState(true);
  const [paypalUrl, setPaypalUrl] = useState<string | null>(null);
  const [paypalOrderData, setPaypalOrderData] = useState<CreateOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [statusCheckIntervalId, setStatusCheckIntervalId] = useState<number | null>(null);
  
  // Animations
  const headerAnimation = useRef(new Animated.Value(10)).current;
  const iconAnimation = useRef(new Animated.Value(1)).current;
  const buttonAnimation = useRef(new Animated.Value(1)).current;
  
  // Animation pour le titre du header
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 0,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
  }, []);
  
  // Animation pour les icônes
  useEffect(() => {
    const pulseAnimation = Animated.sequence([
      Animated.timing(iconAnimation, {
        toValue: 1.2,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(iconAnimation, {
        toValue: 1,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      })
    ]);
    
    Animated.loop(
      pulseAnimation,
      { iterations: 2 }
    ).start();
  }, []);
  
  // Animation pour les boutons
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.linear
      }),
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.linear
      })
    ]).start();
  };
  
  // Gérer le bouton retour
  useEffect(() => {
    logInfo("Configuration du gestionnaire de bouton retour");
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      logInfo("Bouton retour matériel pressé");
      
      Alert.alert(
        'Annuler le paiement',
        'Êtes-vous sûr de vouloir annuler le processus de paiement ?',
        [
          { text: 'Non', style: 'cancel', onPress: () => {
            logInfo("Annulation du paiement refusée par l'utilisateur");
          }},
          { 
            text: 'Oui', 
            style: 'destructive', 
            onPress: () => {
              logInfo("Annulation du paiement confirmée par l'utilisateur");
              navigation.goBack();
              return true;
            }
          },
        ]
      );
      return true;
    });
    
    return () => {
      logInfo("Nettoyage du gestionnaire de bouton retour");
      backHandler.remove();
    };
  }, [navigation]);
  
  // Créer la commande PayPal
  useEffect(() => {
    logInfo("Démarrage du processus de création de commande PayPal");
    
    const createPaypalOrder = async () => {
      try {
        setLoading(true);
        
        if (!user || !user.id) {
          logError("Tentative de paiement sans utilisateur connecté");
          throw new Error('Utilisateur non connecté');
        }
        
        logInfo("Appel du service PayPal pour créer une commande", {
          userId: user.id,
          cartItemsCount: cartItems.length,
          totalAmount: totalAmount
        });
        
        // Créer la commande PayPal
        const orderData = await PaypalService.createOrder(cartItems, user.id);
        
        logInfo("Commande PayPal créée avec succès", {
          paypalOrderId: orderData.id,
          approvalUrl: orderData.approvalUrl
        });
        
        setPaypalOrderData(orderData);
        setPaypalUrl(orderData.approvalUrl);
        setError(null);
      } catch (err: any) {
        logError("Erreur lors de la création de la commande PayPal", err);
        setError(err.message || 'Impossible de créer la commande PayPal');
      } finally {
        setLoading(false);
      }
    };
    
    createPaypalOrder();
  }, [cartItems, user, retryCount]);
  
  // Fonction pour vérifier le statut du paiement
  const checkPaymentStatus = async (paypalOrderId: string) => {
    if (!paypalOrderId) {
      logError("Impossible de vérifier le statut: ID de commande PayPal manquant");
      return;
    }

    try {
      setLoading(true);
      logInfo("Vérification du statut du paiement", { paypalOrderId });
      
      const statusResponse = await PaypalService.checkOrderStatus(paypalOrderId);
      
      logInfo("Statut du paiement reçu", { status: statusResponse.status });
      
      // Vérifier si le paiement est approuvé ou complété
      if (statusResponse.status === 'COMPLETED' || statusResponse.status === 'APPROVED') {
        logInfo("Paiement approuvé, capture de la commande");
        
        // Capturer la commande
        const captureResponse = await PaypalService.captureOrder(paypalOrderId);
        
        logInfo("Commande capturée avec succès", { captureResponse });
        
        // Vider le panier
        await CartService.clearCart();
        
        // Rediriger vers l'écran de succès
        navigation.navigate('PaymentSuccess', {
          orderId: captureResponse.localOrderId || 'unknown',
          paypalOrderId: captureResponse.id,
          totalAmount: totalAmount
        });
        return true; // Indique que le paiement est complété
      } else if (statusResponse.status === 'PENDING') {
        logWarning("Paiement en attente", { status: statusResponse.status });
        Alert.alert(
          "Paiement en attente",
          "Votre paiement est en cours de traitement par PayPal. Vous recevrez une notification lorsqu'il sera finalisé.",
          [{ text: "OK" }]
        );
        return false; // Continuer à vérifier
      } else if (statusResponse.status === 'FAILED') {
        logError("Paiement échoué", { status: statusResponse.status });
        Alert.alert(
          "Paiement échoué",
          "Votre paiement n'a pas pu être traité. Veuillez réessayer plus tard.",
          [{ text: "OK" }]
        );
        setPaymentInitiated(false);
        return true; // Arrêter de vérifier
      } else {
        logWarning("Statut de paiement inconnu", { status: statusResponse.status });
        Alert.alert(
          "Statut de paiement inconnu",
          `Le statut actuel de votre paiement est: ${statusResponse.status}. Nous continuerons à vérifier son évolution.`,
          [{ text: "OK" }]
        );
        return false; // Continuer à vérifier
      }
    } catch (err: any) {
      logError("Erreur lors de la vérification du statut du paiement", err);
      Alert.alert(
        "Erreur de vérification",
        "Impossible de vérifier le statut de votre paiement. Nous réessaierons dans quelques instants.",
        [{ text: "OK" }]
      );
      return false; // Continuer à vérifier malgré l'erreur
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour démarrer la vérification périodique du statut
  const startStatusChecking = (paypalOrderId: string) => {
    logInfo("Démarrage de la vérification périodique du statut", { paypalOrderId });
    
    // Durée maximale de vérification: 2 minutes
    const maxCheckTime = 2 * 60 * 1000; // 2 minutes en millisecondes
    const checkInterval = 5000; // 5 secondes
    
    let elapsedTime = 0;
    
    // Afficher un message pour informer l'utilisateur
    Alert.alert(
      "Redirection vers PayPal",
      "Vous allez être redirigé vers PayPal pour finaliser votre paiement. Après avoir complété le paiement, revenez à l'application pour confirmer votre commande.",
      [{ text: "OK" }]
    );
    
    // Fonction pour effectuer une vérification unique
    const performCheck = async () => {
      const isCompleted = await checkPaymentStatus(paypalOrderId);
      
      if (isCompleted) {
        // Si le paiement est complété ou a échoué définitivement, arrêter les vérifications
        logInfo("Vérification du statut terminée: paiement complété ou échec définitif");
        clearInterval(intervalId);
        return;
      }
      
      elapsedTime += checkInterval;
      
      if (elapsedTime >= maxCheckTime) {
        // Si le temps maximum est atteint, arrêter les vérifications
        logWarning("Temps maximum de vérification atteint");
        clearInterval(intervalId);
        
        Alert.alert(
          "Vérification terminée",
          "Nous avons arrêté la vérification automatique du statut de votre paiement. Vous pouvez vérifier manuellement en appuyant sur 'Vérifier le statut'.",
          [
            { 
              text: "Vérifier le statut", 
              onPress: () => checkPaymentStatus(paypalOrderId) 
            },
            { 
              text: "OK" 
            }
          ]
        );
      }
    };
    
    // Démarrer les vérifications périodiques
    const intervalId = setInterval(performCheck, checkInterval);
    
    // Effectuer une première vérification immédiate
    performCheck();
    
    // Stocker l'ID de l'intervalle pour pouvoir l'arrêter plus tard
    setStatusCheckIntervalId(intervalId);
    
    return () => {
      // Fonction de nettoyage pour arrêter les vérifications
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  };

  // Fonction pour créer et ouvrir une commande PayPal
  const createPaypalOrder = async () => {
    try {
      setLoading(true);
      setPaymentInitiated(true);
      
      logInfo("Création d'une commande PayPal", { cartItems, userId: user.id });
      
      const orderData = await PaypalService.createOrder(cartItems, user.id);
      
      logInfo("Commande PayPal créée", { orderData });
      
      // Stocker les données de la commande PayPal
      setPaypalOrderData(orderData);
      
      // Ouvrir l'URL d'approbation PayPal
      await Linking.openURL(orderData.approvalUrl);
      
      // Démarrer la vérification périodique du statut
      startStatusChecking(orderData.id);
      
    } catch (error: any) {
      logError("Erreur lors de la création de la commande PayPal", error);
      
      Alert.alert(
        "Erreur de paiement",
        "Impossible de créer la commande PayPal. Veuillez réessayer plus tard.",
        [{ text: "OK" }]
      );
      
      setPaymentInitiated(false);
    } finally {
      setLoading(false);
    }
  };

  // Effet pour gérer le nettoyage lors du démontage du composant
  useEffect(() => {
    // Fonction de nettoyage
    return () => {
      // Arrêter la vérification périodique si elle est en cours
      if (statusCheckIntervalId) {
        clearInterval(statusCheckIntervalId);
      }
    };
  }, [statusCheckIntervalId]);
  
  // Gérer l'ouverture du lien PayPal dans le navigateur externe
  const handleOpenPayPalLink = async () => {
    if (!paypalUrl) {
      logError("Tentative d'ouverture du lien PayPal sans URL valide");
      return;
    }
    
    logInfo("Ouverture du lien PayPal dans le navigateur externe", { url: paypalUrl });
    
    try {
      setPaymentInitiated(true);
      const supported = await Linking.canOpenURL(paypalUrl);
      
      if (supported) {
        await Linking.openURL(paypalUrl);
        
        // Afficher des instructions plus claires à l'utilisateur
        Alert.alert(
          "Paiement PayPal en cours",
          "Vous avez été redirigé vers PayPal pour finaliser votre paiement. Une fois le paiement terminé, revenez à l'application. Nous vérifierons automatiquement l'état de votre paiement.",
          [{ text: "Compris" }]
        );
        
        // Démarrer la vérification périodique du statut
        startStatusChecking(paypalOrderData!.id);
      } else {
        logError(`Impossible d'ouvrir l'URL: ${paypalUrl}`);
        setError("Impossible d'ouvrir le lien PayPal");
      }
    } catch (err) {
      logError("Erreur lors de l'ouverture du lien PayPal", err);
      setError("Une erreur est survenue lors de l'ouverture du lien PayPal");
    }
  };
  
  // Fonction pour réessayer la création de commande
  const handleRetry = () => {
    logInfo("Tentative de recréation de la commande PayPal");
    setRetryCount(prev => prev + 1);
    setError(null);
  };
  
  // Rendu de l'interface
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            logInfo("Bouton retour pressé");
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Animated.Text style={[styles.headerTitle, { transform: [{ translateY: headerAnimation }] }]}>
          Paiement
        </Animated.Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Résumé de la commande */}
        <View style={[styles.orderSummary, { backgroundColor: theme.card }]}>
          <View style={styles.sectionTitleContainer}>
            <Animated.View style={{ transform: [{ scale: iconAnimation }] }}>
              <Ionicons name="cart-outline" size={26} color={theme.accent} />
            </Animated.View>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium' }]}>
              Résumé de la commande
            </Text>
          </View>
          
          <View style={styles.orderDetails}>
            <View style={styles.orderDetailRow}>
              <Text style={[styles.orderDetailLabel, { color: theme.text, fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif' }]}>
                Nombre d'articles:
              </Text>
              <Text style={[styles.orderDetailValue, { color: theme.text, fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium' }]}>
                {cartItems.length}
              </Text>
            </View>
            <View style={styles.orderDetailRow}>
              <Text style={[styles.orderDetailLabel, { color: theme.text, fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif' }]}>
                Montant total:
              </Text>
              <Text style={[styles.orderDetailValue, { color: theme.accent, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium' }]}>
                {totalAmount.toFixed(2)} €
              </Text>
            </View>
          </View>
        </View>
        
        {/* Méthode de paiement */}
        <View style={[styles.paymentMethod, { backgroundColor: theme.card }]}>
          <View style={styles.sectionTitleContainer}>
            <Animated.View style={{ transform: [{ scale: iconAnimation }] }}>
              <Ionicons name="card-outline" size={26} color={theme.accent} />
            </Animated.View>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium' }]}>
              Méthode de paiement
            </Text>
          </View>
          
          <View style={styles.paymentOptionContainer}>
            <TouchableOpacity 
              style={[styles.paymentOption, { borderColor: theme.accent }]}
              activeOpacity={0.7}
            >
              <View style={styles.paypalContainer}>
                <Image 
                  source={require('../../../assets/paypal-logo.jpg')} 
                  style={styles.paypalLogo}
                  resizeMode="contain"
                />
              </View>
              <Ionicons name="checkmark-circle" size={24} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: theme.card }]}>
          <View style={styles.sectionTitleContainer}>
            <Animated.View style={{ transform: [{ scale: iconAnimation }] }}>
              <Ionicons name="information-circle-outline" size={26} color={theme.accent} />
            </Animated.View>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium' }]}>
              Instructions
            </Text>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionNumber, { backgroundColor: theme.accent }]}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <Text style={[styles.instructionText, { color: theme.text, fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif' }]}>
              Cliquez sur le bouton "Payer" ci-dessous
            </Text>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionNumber, { backgroundColor: theme.accent }]}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <Text style={[styles.instructionText, { color: theme.text, fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif' }]}>
              Vous serez redirigé vers le site PayPal pour finaliser votre paiement
            </Text>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionNumber, { backgroundColor: theme.accent }]}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <Text style={[styles.instructionText, { color: theme.text, fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif' }]}>
              Une fois le paiement effectué, revenez à l'application
            </Text>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionNumber, { backgroundColor: theme.accent }]}>
              <Text style={styles.instructionNumberText}>4</Text>
            </View>
            <Text style={[styles.instructionText, { color: theme.text, fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif' }]}>
              Cliquez sur "Vérifier le paiement" pour confirmer votre commande
            </Text>
          </View>
        </View>
        
        {/* Affichage des erreurs */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.error }]}>
            <Ionicons name="alert-circle" size={24} color="#fff" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Boutons d'action */}
      <View style={styles.buttonContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Préparation de votre paiement...
            </Text>
          </View>
        ) : (
          <>
            {!paymentInitiated ? (
              <TouchableOpacity
                style={[styles.payButton, { backgroundColor: theme.accent }]}
                onPress={handleOpenPayPalLink}
                disabled={!paypalUrl}
                activeOpacity={0.7}
              >
                <Ionicons name="card" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={[styles.payButtonText, { fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium' }]}>Payer</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.verifyButton, { backgroundColor: theme.accent }]}
                onPress={() => checkPaymentStatus(paypalOrderData!.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={[styles.verifyButtonText, { fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium' }]}>Vérifier le paiement</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.error }]}
              onPress={() => {
                logInfo("Bouton annuler pressé");
                Alert.alert(
                  'Annuler le paiement',
                  'Êtes-vous sûr de vouloir annuler le processus de paiement ?',
                  [
                    { text: 'Non', style: 'cancel' },
                    { 
                      text: 'Oui', 
                      style: 'destructive', 
                      onPress: () => navigation.goBack() 
                    },
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: theme.error, fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium' }]}>
                Annuler
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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
    justifyContent: 'space-between',
    height: 70,
    paddingHorizontal: 15,
    paddingTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
  },
  headerRight: {
    width: 44,
    height: 44,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  orderSummary: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  orderDetails: {
    marginTop: 8,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderDetailLabel: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  orderDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  paymentMethod: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  paymentOptionContainer: {
    marginTop: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  paypalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paypalLogo: {
    width: 220,
    height: 55,
  },
  instructions: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  instructionNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-black',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fff',
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  buttonIcon: {
    marginRight: 10,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;
