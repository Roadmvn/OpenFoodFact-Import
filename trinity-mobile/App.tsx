import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { store } from './src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ThemeProvider>
          <AuthProvider>
            <AppNavigator />
            <StatusBar style="auto" />
            <Toast />
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
