import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Header } from '../../components/common/Header';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export const DashboardScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const welcomeMessage = user?.firstName ? `Bienvenue ${user.firstName}` : 'Bienvenue';

  return (
    <SafeAreaView style={styles.container}>
      <Header title={welcomeMessage} />
      <View style={styles.content}>
        <Text style={styles.title}>Tableau de bord</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Statistiques</Text>
          <Text style={styles.cardText}>Produits scannés : 0</Text>
          <Text style={styles.cardText}>Produits ajoutés : 0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
});
