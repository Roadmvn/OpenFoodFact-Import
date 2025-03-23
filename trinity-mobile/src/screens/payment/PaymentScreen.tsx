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

// Décommenter cette ligne pour utiliser WebView
import { WebView } from 'react-native-webview';
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
  
  // Ajouter un état pour stocker le HTML contenant les boutons PayPal
  const [paypalHtml, setPaypalHtml] = useState<string | null>(null);
  
  // Modifier la création de commande pour générer le HTML avec le bon client ID PayPal
  const createPaypalOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      logInfo("Création d'une commande PayPal", { cartItems, userId: user.id });
      
      // On utilise le même client ID que dans le frontend
      const CLIENT_ID = "AX2YAQ3gXr-WidNvgMevZM5ysidZRocYDSF2sxkp5FXjhv8gcQtLpJ7A9YR7PG58N0NRJcEUXgVLrTSb";
      
      const orderData = await PaypalService.createOrder(cartItems, user.id);
      
      logInfo("Commande PayPal créée", { orderData });
      
      // Stocker les données de la commande PayPal
      setPaypalOrderData(orderData);
      
      // HTML pour les boutons PayPal - utiliser la même structure que dans le frontend
      const paypalButtonHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=EUR"></script>
        </head>
        <body style="display:flex;justify-content:center;align-items:center;height:100%;margin:0;background:#f5f5f5;">
          <div id="paypal-button-container" style="width:100%;max-width:300px;"></div>
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              // Vérifier si le SDK PayPal est chargé
              if (typeof paypal === 'undefined') {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'error',
                  error: 'Impossible de charger le SDK PayPal'
                }));
              } else {
                // Utiliser la même structure que dans le front
                paypal
                  .Buttons({
                    // Utiliser l'ID de commande PayPal retourné par votre backend
                    createOrder: function() {
                      return "${orderData.id}";
                    },
                    onApprove: async function(data) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'success',
                        orderId: data.orderID
                      }));
                    },
                    onError: function(err) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'error',
                        error: err.message || 'Erreur lors du paiement PayPal'
                      }));
                    }
                  })
                  .render('#paypal-button-container');
              }
            });
          </script>
        </body>
        </html>
      `;
      
      setPaypalHtml(paypalButtonHtml);
      setLoading(false);
      
    } catch (error) {
      logError("Erreur lors de la création de la commande PayPal", error);
      setError(error.message || "Impossible de créer la commande PayPal");
      setLoading(false);
    }
  };

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

  // Correction de la gestion des messages WebView
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      logInfo("Message reçu de WebView PayPal", data);
      
      if (data.type === 'success') {
        // Naviguer vers l'écran de succès comme dans le frontend
        navigation.navigate('PaymentSuccess', {
          orderId: paypalOrderData!.id,
          paypalOrderId: data.orderId,
          totalAmount: totalAmount
        });
      } else if (data.type === 'error') {
        setError(data.error || "Erreur lors du paiement PayPal");
      }
    } catch (err) {
      logError("Erreur lors du traitement du message WebView", err);
      setError("Erreur lors du traitement de la réponse PayPal");
    }
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Préparation de votre paiement...
            </Text>
          </View>
        ) : error ? (
          <View style={[styles.errorContainer, { backgroundColor: theme.error }]}>
            <Ionicons name="alert-circle" size={24} color="#fff" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                logInfo("Tentative de recréation de la commande PayPal");
                setRetryCount(prev => prev + 1);
                setError(null);
              }}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : paypalHtml ? (
          <View style={styles.webViewContainer}>
            <WebView
              source={{ html: paypalHtml }}
              onMessage={handleWebViewMessage}
              style={styles.webView}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="small" color={theme.accent} />
                </View>
              )}
            />
          </View>
        ) : paymentInitiated ? (
          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: theme.accent }]}
            onPress={() => checkPaymentStatus(paypalOrderData!.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={[styles.verifyButtonText, { fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium' }]}>
              Vérifier le paiement
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: theme.accent }]}
            onPress={createPaypalOrder}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-paypal" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={[styles.payButtonText, { fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium' }]}>
              Payer avec PayPal
            </Text>
          </TouchableOpacity>
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
        ) : error ? (
          <View style={[styles.errorContainer, { backgroundColor: theme.error }]}>
            <Ionicons name="alert-circle" size={24} color="#fff" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                logInfo("Tentative de recréation de la commande PayPal");
                setRetryCount(prev => prev + 1);
                setError(null);
              }}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : paypalHtml ? (
          <View style={styles.webViewContainer}>
            <WebView
              source={{ html: paypalHtml }}
              onMessage={handleWebViewMessage}
              style={styles.webView}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="small" color={theme.accent} />
                </View>
              )}
            />
          </View>
        ) : paymentInitiated ? (
          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: theme.accent }]}
            onPress={() => checkPaymentStatus(paypalOrderData!.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={[styles.verifyButtonText, { fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium' }]}>
              Vérifier le paiement
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: theme.accent }]}
            onPress={createPaypalOrder}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-paypal" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={[styles.payButtonText, { fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium' }]}>
              Payer avec PayPal
            </Text>
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
  webViewContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentScreen;
