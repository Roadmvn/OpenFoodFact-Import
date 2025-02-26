import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/auth/LoginScreen';
import { store } from './src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Login"
            screenOptions={{
              headerShown: false
            }}
          >
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  );
}
