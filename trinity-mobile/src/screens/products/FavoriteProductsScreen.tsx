import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, IconButton, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { ProductStorageService } from '../../services/products/ProductStorageService';

// Interface pour les produits favoris
interface FavoriteProduct {
  id: string;
  name: string;
  image?: string;
  date: number;
}

const FavoriteProductsScreen = () => {
  const navigation = useNavigation<any>();
  const { theme, colorBlindMode } = useTheme();
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Log pour déboguer le thème
  useEffect(() => {
    console.log('FavoriteProductsScreen - Mode daltonien actif:', colorBlindMode);
    console.log('FavoriteProductsScreen - Couleur primaire actuelle:', theme.primary);
    console.log('FavoriteProductsScreen - Couleur d\'accent actuelle:', theme.accent);
  }, [colorBlindMode, theme]);

  // Charger les produits favoris au démarrage
  useEffect(() => {
    loadFavoriteProducts();
  }, []);

  // Fonction pour charger les produits favoris depuis le stockage local
  const loadFavoriteProducts = async () => {
    try {
      setIsLoading(true);
      const products = await ProductStorageService.getFavoriteProducts();
      setFavoriteProducts(products);
    } catch (error) {
      console.error('Erreur lors du chargement des produits favoris:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Naviguer vers l'écran de scan
  const handleScanPress = () => {
    navigation.navigate('NativeScan');
  };

  // Naviguer vers le détail d'un produit
  const handleProductPress = (product: FavoriteProduct) => {
    navigation.navigate('ProductDetail', { barcode: product.id });
  };

  // Supprimer un produit des favoris
  const handleRemoveFavorite = async (productId: string) => {
    try {
      await ProductStorageService.removeFavoriteProduct(productId);
      loadFavoriteProducts(); // Recharger la liste après suppression
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
    }
  };

  // Rendu d'un élément de la liste
  const renderProductItem = ({ item }: { item: FavoriteProduct }) => (
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
      <IconButton
        icon="heart-off"
        iconColor={theme.error}
        size={20}
        onPress={() => handleRemoveFavorite(item.id)}
      />
    </Animatable.View>
  );

  // Contenu de l'écran lorsqu'il n'y a pas de produits favoris
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
          icon="heart"
          iconColor="#E53935"
          size={60}
        />
      </Animatable.View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun produit favori</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Ajoutez des produits à vos favoris pour les retrouver facilement
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
        <Text style={[styles.headerTitle, { color: theme.headerText }]}>Mes favoris</Text>
        <View style={styles.headerRight} />
      </View>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={{ color: theme.text }}>Chargement...</Text>
          </View>
        ) : (
          <FlatList
            data={favoriteProducts}
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

export default FavoriteProductsScreen; 