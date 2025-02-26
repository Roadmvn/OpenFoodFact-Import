import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';

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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
