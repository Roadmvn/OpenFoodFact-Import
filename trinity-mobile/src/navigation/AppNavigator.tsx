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
          // Routes publiques
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                animationTypeForReplace: !token ? 'pop' : 'push',
              }}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Routes protégées
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            {/* Ajout de l'écran de scan */}
            <Stack.Screen name="Scan" component={ScanScreen} />
            {/* Ajout de l'écran de détail du produit */}
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
