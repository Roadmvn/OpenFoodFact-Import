import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../../store/slices/authSlice';
import AuthService from '../../services/auth/authService';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

interface HeaderProps {
  title?: string;
  showLogout?: boolean;
}

type HeaderNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export const Header: React.FC<HeaderProps> = ({ 
  title = 'OpenFoodFacts',
  showLogout = true 
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<HeaderNavigationProp>();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      dispatch(logout());
      navigation.replace('Login');
      Toast.show({
        type: 'success',
        text1: 'Déconnexion réussie',
        position: 'top'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de déconnexion',
        text2: error instanceof Error ? error.message : 'Une erreur est survenue',
        position: 'top'
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showLogout && (
          <TouchableOpacity 
            onPress={handleLogout} 
            style={styles.logoutButton}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    height: 70,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginLeft: 15,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
