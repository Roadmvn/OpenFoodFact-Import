import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Appbar, Text, Divider, Card, Title, Paragraph, Button, Chip, List } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetailsRequest } from '../../store/slices/orderSlice';
import { RootState } from '../../store';
import { OrderStatus } from '../../store/types/order';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import * as Animatable from 'react-native-animatable';

// Définition des types pour la navigation
type RootStackParamList = {
  OrderDetails: { orderId: number };
  OrderHistory: undefined;
};

type OrderDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetails'>;
type OrderDetailsScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

const OrderDetailsScreen = () => {
  const navigation = useNavigation<OrderDetailsScreenNavigationProp>();
  const route = useRoute<OrderDetailsScreenRouteProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { selectedOrder, loading, error } = useSelector((state: RootState) => state.order);
  
  const { orderId } = route.params;

  // Charger les détails de la commande au chargement de l'écran
  useEffect(() => {
    console.log(`OrderDetailsScreen: Loading details for order ${orderId}`);
    dispatch(fetchOrderDetailsRequest(orderId));
  }, [dispatch, orderId]);

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme?.background || '#f5f5f5' }]}>
      <Appbar.Header style={[styles.header, { backgroundColor: theme?.primary || '#2A2E45' }]}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="Détails de la commande" titleStyle={{ color: '#FFFFFF' }} />
      </Appbar.Header>

      {/* Contenu principal */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme?.accent || '#4CAF50'} />
            <Text style={[styles.loadingText, { color: theme?.text || '#000000' }]}>Chargement des détails...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={[styles.errorText, { color: theme?.text || '#000000' }]}>Erreur : {error}</Text>
            <Button
              mode="contained"
              style={[styles.retryButton, { backgroundColor: theme?.accent || '#4CAF50' }]}
              onPress={() => dispatch(fetchOrderDetailsRequest(orderId))}
            >
              Réessayer
            </Button>
          </View>
        ) : selectedOrder ? (
          <ScrollView>
            <Animatable.View
              animation="fadeIn"
              duration={500}
            >
              {/* Informations générales de la commande */}
              <Card style={[styles.card, { backgroundColor: theme?.card || '#FFFFFF' }]}>
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <Title style={{ color: theme?.text || '#000000' }}>Commande #{selectedOrder.id}</Title>
                    <Chip
                      mode="outlined"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status as OrderStatus) }}
                      textStyle={{ color: '#FFFFFF' }}
                    >
                      {getStatusLabel(selectedOrder.status as OrderStatus)}
                    </Chip>
                  </View>
                  
                  <Divider style={styles.divider} />
                  
                  <View style={styles.orderInfo}>
                    <Paragraph style={{ color: theme?.text || '#000000' }}>
                      <Text style={styles.label}>Date : </Text>
                      {formatDate(selectedOrder.createdAt)}
                    </Paragraph>
                    
                    {selectedOrder.seller && (
                      <Paragraph style={{ color: theme?.text || '#000000' }}>
                        <Text style={styles.label}>Vendeur : </Text>
                        {selectedOrder.seller.firstName} {selectedOrder.seller.lastName}
                      </Paragraph>
                    )}
                    
                    <Paragraph style={{ color: theme?.text || '#000000' }}>
                      <Text style={styles.label}>Méthode de paiement : </Text>
                      {selectedOrder.paypalPayment ? 'PayPal' : 'Autre'}
                    </Paragraph>
                    
                    {selectedOrder.paypalTransactionId && (
                      <Paragraph style={{ color: theme?.text || '#000000' }}>
                        <Text style={styles.label}>Transaction PayPal : </Text>
                        {selectedOrder.paypalTransactionId}
                      </Paragraph>
                    )}
                  </View>
                </Card.Content>
              </Card>

              {/* Liste des produits */}
              <Card style={[styles.card, { backgroundColor: theme?.card || '#FFFFFF', marginTop: 16 }]}>
                <Card.Content>
                  <Title style={{ color: theme?.text || '#000000' }}>Produits</Title>
                  
                  <Divider style={styles.divider} />
                  
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item) => (
                      <Animatable.View
                        key={item.id}
                        animation="fadeIn"
                        duration={500}
                        delay={300}
                      >
                        <Card style={[styles.itemCard, { backgroundColor: theme?.cardAlt || '#F9F9F9' }]}>
                          <Card.Content>
                            <View style={styles.itemRow}>
                              {item.internalProduct?.imageUrl && (
                                <Image
                                  source={{ uri: item.internalProduct.imageUrl }}
                                  style={styles.productImage}
                                  resizeMode="contain"
                                />
                              )}
                              
                              <View style={styles.itemDetails}>
                                <Paragraph style={[styles.itemName, { color: theme?.text || '#000000' }]}>
                                  {item.internalProduct?.name || `Produit #${item.internalProductId}`}
                                </Paragraph>
                                
                                <View style={styles.itemPriceRow}>
                                  <Paragraph style={{ color: theme?.textSecondary || '#666666' }}>
                                    {item.quantity} x {item.unitPrice.toFixed(2)} €
                                  </Paragraph>
                                  <Paragraph style={[styles.itemSubtotal, { color: theme?.text || '#000000' }]}>
                                    {item.subtotal.toFixed(2)} €
                                  </Paragraph>
                                </View>
                              </View>
                            </View>
                          </Card.Content>
                        </Card>
                      </Animatable.View>
                    ))
                  ) : (
                    <Text style={{ color: theme?.textSecondary || '#666666', textAlign: 'center', marginTop: 16 }}>
                      Aucun détail de produit disponible
                    </Text>
                  )}
                </Card.Content>
              </Card>

              {/* Récapitulatif de la commande */}
              <Card style={[styles.card, { backgroundColor: theme?.card || '#FFFFFF', marginTop: 16, marginBottom: 24 }]}>
                <Card.Content>
                  <Title style={{ color: theme?.text || '#000000' }}>Récapitulatif</Title>
                  
                  <Divider style={styles.divider} />
                  
                  <View style={styles.summaryRow}>
                    <Text style={{ color: theme?.text || '#000000' }}>Total</Text>
                    <Text style={[styles.totalAmount, { color: theme?.text || '#000000' }]}>
                      {selectedOrder.totalAmount.toFixed(2)} €
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </Animatable.View>
          </ScrollView>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={[styles.errorText, { color: theme?.text || '#000000' }]}>
              Impossible de trouver les détails de la commande
            </Text>
            <Button
              mode="contained"
              style={[styles.retryButton, { backgroundColor: theme?.accent || '#4CAF50' }]}
              onPress={() => navigation.goBack()}
            >
              Retour
            </Button>
          </View>
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
  card: {
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
  orderInfo: {
    marginVertical: 8,
  },
  label: {
    fontWeight: 'bold',
  },
  itemCard: {
    marginVertical: 8,
    borderRadius: 8,
    elevation: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#EEEEEE',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemSubtotal: {
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 18,
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
});

export default OrderDetailsScreen;
