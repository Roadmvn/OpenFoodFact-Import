import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import CartService, { CartItem } from '../../services/cart/cartService';
import { useTheme } from '../../context/ThemeContext';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const navigation = useNavigation();
  const { theme, isColorblindMode } = useTheme();
  
  // Log pour déboguer le thème
  useEffect(() => {
    console.log('CartScreen - Mode daltonien actif:', isColorblindMode);
    console.log('CartScreen - Couleur primaire actuelle:', theme.primary);
    console.log('CartScreen - Couleur d\'accent actuelle:', theme.accent);
  }, [isColorblindMode, theme]);
  
  useEffect(() => {
    loadCartItems();
  }, []);
  
  const loadCartItems = async () => {
    try {
      setLoading(true);
      const items = await CartService.getCart();
      setCartItems(items);
      
      // Calculer le prix total (à implémenter plus tard avec les vrais prix)
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotalPrice(total);
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      Alert.alert('Erreur', 'Impossible de charger le contenu du panier.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveItem = async (barcode: string) => {
    try {
      await CartService.removeFromCart(barcode);
      // Recharger le panier
      loadCartItems();
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      Alert.alert('Erreur', 'Impossible de supprimer le produit du panier.');
    }
  };
  
  const handleUpdateQuantity = async (barcode: string, quantity: number) => {
    try {
      await CartService.updateQuantity(barcode, quantity);
      // Recharger le panier
      loadCartItems();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la quantité.');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Panier vide', 'Veuillez ajouter des produits à votre panier avant de procéder au paiement.');
      return;
    }
    
    // Navigation vers l'écran de paiement (à implémenter plus tard)
    // navigation.navigate('Payment');
    Alert.alert('Paiement', 'Redirection vers la page de paiement PayPal...');
  };
  
  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={[styles.cartItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="contain" />
      ) : (
        <View style={styles.noImageContainer}>
          <Ionicons name="image-outline" size={40} color={theme.border} />
        </View>
      )}
      
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.text }]}>{item.productName}</Text>
        <Text style={[styles.productBrand, { color: theme.textSecondary }]}>{item.brand}</Text>
        <Text style={[styles.productPrice, { color: theme.accent }]}>{item.price.toFixed(2)} €</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.barcode, item.quantity - 1)}
          >
            <Ionicons name="remove" size={20} color={theme.accent} />
          </TouchableOpacity>
          
          <Text style={[styles.quantityText, { color: theme.text }]}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.barcode, item.quantity + 1)}
          >
            <Ionicons name="add" size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.barcode)}
      >
        <Ionicons name="trash-outline" size={24} color={theme.error} />
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon panier</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Chargement du panier...</Text>
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={80} color={theme.border} />
          <Text style={[styles.emptyCartText, { color: theme.text }]}>Votre panier est vide</Text>
          <TouchableOpacity 
            style={[styles.continueShoppingButton, { backgroundColor: theme.secondary }]}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.continueShoppingText}>Continuer mes achats</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.barcode}
            contentContainerStyle={styles.cartList}
          />
          
          <View style={[styles.summaryContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.text }]}>Total</Text>
              <Text style={[styles.summaryValue, { color: theme.accent }]}>{totalPrice.toFixed(2)} €</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.checkoutButton, { backgroundColor: isColorblindMode ? theme.accent : theme.secondary }]}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <Ionicons name="card" size={24} color="#FFFFFF" style={styles.checkoutIcon} />
              <Text style={[styles.checkoutText, { color: '#FFFFFF' }]}>Procéder au paiement</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    marginVertical: 20,
  },
  continueShoppingButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartList: {
    padding: 10,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  noImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginRight: 15,
    borderRadius: 4,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 5,
  },
  summaryContainer: {
    padding: 15,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  checkoutIcon: {
    marginRight: 10,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});