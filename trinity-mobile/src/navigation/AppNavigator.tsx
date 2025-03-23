import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
// Import de l'écran de scan
import ScanScreen from '../screens/camera/ScanScreen';
// Import des écrans de scan
import ExpoScanScreen from '../screens/camera/ExpoScanScreen';
import SimpleScanScreen from '../screens/camera/SimpleScanScreen';
// Import de l'écran de détail du produit
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
// Import des nouveaux écrans de produits scannés et favoris
import ScannedProductsScreen from '../screens/products/ScannedProductsScreen';
import FavoriteProductsScreen from '../screens/products/FavoriteProductsScreen';
// Import de l'écran du panier
import CartScreen from '../screens/cart/CartScreen';
// Import de l'écran d'accessibilité
import AccessibilityScreen from '../screens/settings/AccessibilityScreen';
// Import de l'écran de profil
import ProfileScreen from '../screens/profile/ProfileScreen';
// Import des écrans liés aux commandes
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
// Import des écrans de paiement
import PaymentScreen from '../screens/payment/PaymentScreen';
import PaymentSuccessScreen from '../screens/payment/PaymentSuccessScreen';

// Import conditionnel de NativeScanScreen uniquement si on n'est pas dans Expo Go
const getNativeScanScreen = () => {
  if (__DEV__ && process.env.EXPO_ENVIRONMENT !== 'expo') {
    try {
      // Import dynamique de NativeScanScreen uniquement si nécessaire
      return require('../screens/camera/NativeScanScreen').default;
    } catch (e) {
      console.warn('NativeScanScreen non disponible:', e);
      return SimpleScanScreen;
    }
  }
  return SimpleScanScreen;
};

const NativeScanScreenComponent = getNativeScanScreen();

const Stack = createNativeStackNavigator();

// Fonction pour choisir le scanner en fonction de la plateforme
const getScannerComponent = () => {
  // Utiliser notre scanner simplifié qui devrait fonctionner sur Expo Go
  return SimpleScanScreen;
};

export default function AppNavigator() {
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log('Navigation - État du token:', token ? 'présent' : 'absent');
  }, [token]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        {!token ? (
          // Écrans accessibles sans authentification
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                animationTypeForReplace: 'pop',
              }}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
          </>
        ) : (
          // Écrans accessibles uniquement après authentification
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Scan" component={ScanScreen} />
            <Stack.Screen name="NativeScan" component={NativeScanScreenComponent} />
            <Stack.Screen name="ExpoScan" component={getScannerComponent()} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ScannedProducts" component={ScannedProductsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="FavoriteProducts" component={FavoriteProductsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
            <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
