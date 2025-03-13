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
// Import de l'écran de détail du produit
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
// Import de l'écran du panier
import CartScreen from '../screens/cart/CartScreen';
// Import de l'écran d'accessibilité
import AccessibilityScreen from '../screens/settings/AccessibilityScreen';
// Import de l'écran de profil
import ProfileScreen from '../screens/profile/ProfileScreen';
// Import des écrans liés aux commandes
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';

const Stack = createNativeStackNavigator();

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
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
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
