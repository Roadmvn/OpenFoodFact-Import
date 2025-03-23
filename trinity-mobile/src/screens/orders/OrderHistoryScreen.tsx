import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Appbar, Text, Divider, Card, Title, Paragraph, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersRequest } from '../../store/slices/orderSlice';
import { RootState } from '../../store';
import { Order, OrderStatus } from '../../store/types/order';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import * as Animatable from 'react-native-animatable';

// Définition des types pour la navigation
type RootStackParamList = {
  OrderDetails: { orderId: number };
  OrderHistory: undefined;
};

type OrderHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderHistory'>;

const OrderHistoryScreen = () => {
  const navigation = useNavigation<OrderHistoryScreenNavigationProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { orders, loading, error } = useSelector((state: RootState) => state.order);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les commandes au chargement de l'écran
  useEffect(() => {
    console.log('OrderHistoryScreen: Loading orders');
    dispatch(fetchOrdersRequest());
  }, [dispatch]);

  // Fonction pour rafraîchir la liste des commandes
  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchOrdersRequest());
    setRefreshing(false);
  };

  // Fonction pour naviguer vers les détails d'une commande
  const navigateToOrderDetails = (orderId: number) => {
    navigation.navigate('OrderDetails', { orderId });
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return '#FFA500'; // Orange
      case OrderStatus.COMPLETED:
        return '#4CAF50'; // Vert
      case OrderStatus.CANCELLED:
        return '#F44336'; // Rouge
      default:
        return '#757575'; // Gris
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'En cours';
      case OrderStatus.COMPLETED:
        return 'Terminée';
      case OrderStatus.CANCELLED:
        return 'Annulée';
      default:
        return 'Inconnu';
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Rendu d'une commande
  const renderOrderItem = ({ item }: { item: Order }) => (
    <Animatable.View
      animation="fadeIn"
      duration={500}
      delay={200}
    >
      <TouchableOpacity
        onPress={() => navigateToOrderDetails(item.id)}
        style={styles.orderItemContainer}
      >
        <Card style={[styles.orderCard, { backgroundColor: theme?.card || '#FFFFFF' }]}>
          <Card.Content>
            <View style={styles.orderHeader}>
              <Title style={{ color: theme?.text || '#000000' }}>Commande #{item.id}</Title>
              <Chip
                mode="outlined"
                style={{ backgroundColor: getStatusColor(item.status as OrderStatus) }}
                textStyle={{ color: '#FFFFFF' }}
              >
                {getStatusLabel(item.status as OrderStatus)}
              </Chip>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.orderDetails}>
              <Paragraph style={{ color: theme?.text || '#000000' }}>
                <Text style={styles.label}>Date : </Text>
                {formatDate(item.createdAt)}
              </Paragraph>
              <Paragraph style={{ color: theme?.text || '#000000' }}>
                <Text style={styles.label}>Montant : </Text>
                {item.totalAmount.toFixed(2)} €
              </Paragraph>
              {item.paypalPayment && (
                <Paragraph style={{ color: theme?.text || '#000000' }}>
                  <Text style={styles.label}>Paiement : </Text>
                  PayPal
                </Paragraph>
              )}
            </View>
            
            <Button
              mode="contained"
              style={[styles.detailsButton, { backgroundColor: theme?.accent || '#4CAF50' }]}
              onPress={() => navigateToOrderDetails(item.id)}
            >
              Voir les détails
            </Button>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme?.background || '#f5f5f5' }]}>
      <Appbar.Header style={[styles.header, { backgroundColor: theme?.primary || '#2A2E45' }]}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="Historique des commandes" titleStyle={{ color: '#FFFFFF' }} />
      </Appbar.Header>

      {/* Contenu principal */}
      <View style={styles.content}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme?.accent || '#4CAF50'} />
            <Text style={[styles.loadingText, { color: theme?.text || '#000000' }]}>Chargement des commandes...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={[styles.errorText, { color: theme?.text || '#000000' }]}>Erreur : {error}</Text>
            <Button
              mode="contained"
              style={[styles.retryButton, { backgroundColor: theme?.accent || '#4CAF50' }]}
              onPress={handleRefresh}
            >
              Réessayer
            </Button>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={48} color={theme?.accent || '#4CAF50'} />
            <Text style={[styles.emptyText, { color: theme?.text || '#000000' }]}>Vous n'avez pas encore de commandes</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  orderItemContainer: {
    marginBottom: 16,
  },
  orderCard: {
    borderRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  orderDetails: {
    marginVertical: 8,
  },
  label: {
    fontWeight: 'bold',
  },
  detailsButton: {
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default OrderHistoryScreen;