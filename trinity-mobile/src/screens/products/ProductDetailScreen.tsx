import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ProductService, { ProductData } from '../../services/auth/product/productService';
import CartService, { CartItem } from '../../services/cart/cartService';

// Définition du type pour la navigation
type RootStackParamList = {
  Dashboard: undefined;
  Scan: undefined;
  ProductDetail: { barcode: string };
  Cart: undefined;
};

const ProductDetailScreen = () => {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { barcode } = route.params as { barcode: string };
  
  // Fonction pour ajouter le produit au panier
  const handleAddToCart = async () => {
    if (product) {
      try {
        // Créer un objet CartItem avec les informations du produit
        const cartItem: CartItem = {
          barcode: barcode,
          productName: product.product.product_name || 'Produit inconnu',
          brand: product.product.brands || 'Marque inconnue',
          imageUrl: product.product.image_url || '',
          quantity: 1,
          price: 0 // À définir plus tard si nécessaire
        };
        
        // Ajouter le produit au panier
        await CartService.addToCart(cartItem);
        
        // Afficher une alerte pour indiquer que le produit a été ajouté au panier
        Alert.alert(
          "Produit ajouté",
          `${product.product.product_name} a été ajouté à votre panier.`,
          [
            { 
              text: "Continuer mes achats", 
              style: "cancel",
              onPress: () => {
                // Naviguer vers l'écran de scan pour scanner d'autres produits
                navigation.navigate('Scan');
              }
            },
            { 
              text: "Voir mon panier", 
              onPress: () => {
                // Navigation vers l'écran du panier
                navigation.navigate('Cart');
              } 
            }
          ]
        );
      } catch (error) {
        console.error('Erreur lors de l\'ajout au panier:', error);
        Alert.alert("Erreur", "Impossible d'ajouter le produit au panier.");
      }
    }
  };
  
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const data = await ProductService.getProductByBarcode(barcode);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError('Impossible de récupérer les informations du produit');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [barcode]);
  
  const renderNutrientItem = (label: string, value: string | number | undefined, unit: string = '') => (
    <View style={styles.nutrientItem}>
      <Text style={styles.nutrientLabel}>{label}</Text>
      <Text style={styles.nutrientValue}>{value || 'N/A'} {unit}</Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du produit</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Chargement des informations...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#FF5252" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      ) : product ? (
        <ScrollView style={styles.scrollView}>
          <View style={styles.productHeader}>
            {product.product.image_url ? (
              <Image 
                source={{ uri: product.product.image_url }} 
                style={styles.productImage} 
                resizeMode="contain"
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons name="image-outline" size={80} color="#CCCCCC" />
                <Text style={styles.noImageText}>Aucune image</Text>
              </View>
            )}
            
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.product.product_name || 'Produit inconnu'}</Text>
              <Text style={styles.productBrand}>{product.product.brands || 'Marque inconnue'}</Text>
              <Text style={styles.barcodeText}>Code-barres: {product.code}</Text>
            </View>
          </View>
          
          {product.product.nutriscore_grade && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreTitle}>Nutriscore</Text>
              <Text style={styles.scoreValue}>{product.product.nutriscore_grade.toUpperCase()}</Text>
            </View>
          )}
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Valeurs nutritionnelles (pour 100g)</Text>
            <View style={styles.nutrientsContainer}>
              {renderNutrientItem('Énergie', product.product.nutriments.energy_100g, 'kcal')}
              {renderNutrientItem('Matières grasses', product.product.nutriments.fat_100g, 'g')}
              {renderNutrientItem('Dont acides gras saturés', product.product.nutriments.saturated_fat_100g, 'g')}
              {renderNutrientItem('Glucides', product.product.nutriments.carbohydrates_100g, 'g')}
              {renderNutrientItem('Dont sucres', product.product.nutriments.sugars_100g, 'g')}
              {renderNutrientItem('Protéines', product.product.nutriments.proteins_100g, 'g')}
              {renderNutrientItem('Sel', product.product.nutriments.salt_100g, 'g')}
            </View>
          </View>
          
          {product.product.ingredients_text && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Ingrédients</Text>
              <Text style={styles.ingredientsText}>{product.product.ingredients_text}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.addToCartButton}
            activeOpacity={0.8}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart" size={24} color="#FFFFFF" style={styles.cartIcon} />
            <Text style={styles.addToCartText}>Ajouter au panier</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="help-circle" size={60} color="#FF9800" />
          <Text style={styles.errorText}>Aucune information disponible</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2A2E45',
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
    marginRight: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3E437A',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  productHeader: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  noImageText: {
    marginTop: 10,
    color: '#999',
  },
  productInfo: {
    paddingHorizontal: 10,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2A2E45',
  },
  productBrand: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  barcodeText: {
    fontSize: 14,
    color: '#999',
  },
  scoreContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2A2E45',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E437A',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2A2E45',
  },
  nutrientsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nutrientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nutrientLabel: {
    fontSize: 14,
    color: '#333',
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  ingredientsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cartIcon: {
    marginRight: 10,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;