import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, IconButton, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { ProductStorageService } from '../../services/products/ProductStorageService';

// Interface pour les produits scannés
interface ScannedProduct {
  id: string;
  name: string;
  image?: string;
  date: number;
}

const ScannedProductsScreen = () => {
  const navigation = useNavigation<any>();
  const { theme, colorBlindMode } = useTheme();
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Log pour déboguer le thème
  useEffect(() => {
    console.log('ScannedProductsScreen - Mode daltonien actif:', colorBlindMode);
    console.log('ScannedProductsScreen - Couleur primaire actuelle:', theme.primary);
    console.log('ScannedProductsScreen - Couleur d\'accent actuelle:', theme.accent);
  }, [colorBlindMode, theme]);

  // Charger les produits scannés au démarrage
  useEffect(() => {
    loadScannedProducts();
  }, []);

  // Fonction pour charger les produits scannés depuis le stockage local
  const loadScannedProducts = async () => {
    try {
      setIsLoading(true);
      const products = await ProductStorageService.getScannedProducts();
      setScannedProducts(products);
    } catch (error) {
      console.error('Erreur lors du chargement des produits scannés:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Naviguer vers l'écran de scan
  const handleScanPress = () => {
    navigation.navigate('NativeScan');
  };

  // Naviguer vers le détail d'un produit
  const handleProductPress = (product: ScannedProduct) => {
    navigation.navigate('ProductDetail', { barcode: product.id });
  };

  // Supprimer un produit scanné
  const handleDeleteProduct = async (productId: string) => {
    try {
      await ProductStorageService.removeScannedProduct(productId);
      loadScannedProducts(); // Recharger la liste après suppression
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
    }
  };

  // Ajouter aux favoris
  const handleAddToFavorites = async (product: ScannedProduct) => {
    try {
      await ProductStorageService.toggleFavoriteProduct(product);
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
    }
  };

  // Rendu d'un élément de la liste
  const renderProductItem = ({ item }: { item: ScannedProduct }) => (
    <Animatable.View
      animation="fadeIn"
      duration={500}
      style={[styles.productItem, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      <TouchableOpacity 
        style={styles.productContent}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.productImageContainer}>
          {item.image ? (
            <Avatar.Image
              size={50}
              source={{ uri: item.image }}
            />
          ) : (
            <LinearGradient
              colors={theme.cardGradient}
              style={styles.productImagePlaceholder}
            >
              <Text style={styles.productImageText}>{item.name.charAt(0)}</Text>
            </LinearGradient>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.productDate, { color: theme.textSecondary }]}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actionButtons}>
        <IconButton
          icon="heart-outline"
          iconColor="#E53935"
          size={20}
          onPress={() => handleAddToFavorites(item)}
        />
        <IconButton
          icon="delete"
          iconColor={theme.error}
          size={20}
          onPress={() => handleDeleteProduct(item.id)}
        />
      </View>
    </Animatable.View>
  );

  // Contenu de l'écran lorsqu'il n'y a pas de produits
  const renderEmptyState = () => (
    <Animatable.View 
      animation="fadeIn" 
      style={styles.emptyContainer}
    >
      <Animatable.View 
        animation="pulse" 
        iterationCount="infinite" 
        iterationDelay={2000}
        style={styles.emptyIconContainer}
      >
        <IconButton
          icon="qrcode-scan"
          iconColor={theme.accent}
          size={60}
        />
      </Animatable.View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun produit scanné</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Scannez un produit pour l'ajouter à votre historique
      </Text>
      <Animatable.View 
        animation="pulse" 
        iterationCount="infinite"
        iterationDelay={1000}
        style={styles.scanButtonContainer}
      >
        <Button
          mode="contained"
          buttonColor={theme.accent}
          onPress={handleScanPress}
          style={styles.scanButton}
        >
          Scanner un produit
        </Button>
      </Animatable.View>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar backgroundColor={theme.headerBackground} barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <IconButton
          icon="arrow-left"
          iconColor={theme.headerText}
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.headerTitle, { color: theme.headerText }]}>Produits scannés</Text>
        <View style={styles.headerRight} />
      </View>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={{ color: theme.text }}>Chargement...</Text>
          </View>
        ) : (
          <FlatList
            data={scannedProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productDate: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  scanButtonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  scanButton: {
    paddingVertical: 8,
    borderRadius: 24,
  },
});

export default ScannedProductsScreen; 