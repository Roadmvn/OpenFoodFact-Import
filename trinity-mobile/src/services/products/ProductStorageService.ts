import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces pour les produits
export interface Product {
  id: string;
  name: string;
  image?: string;
  category?: string;
  details?: any;
  date: number;
}

// Clés de stockage
const STORAGE_KEYS = {
  SCANNED_PRODUCTS: 'scannedProducts',
  FAVORITE_PRODUCTS: 'favoriteProducts',
  COUNTERS: 'counters',
};

// Service de stockage des produits
export class ProductStorageService {
  /**
   * Enregistre un produit scanné
   * @param product Produit à enregistrer
   */
  static async saveScannedProduct(product: Product): Promise<void> {
    try {
      // Récupérer la liste actuelle
      const storedProducts = await this.getScannedProducts();
      
      // Vérifier si le produit existe déjà
      const existingProductIndex = storedProducts.findIndex(p => p.id === product.id);
      
      if (existingProductIndex >= 0) {
        // Mettre à jour la date du produit existant et le déplacer en première position
        storedProducts.splice(existingProductIndex, 1);
        storedProducts.unshift({
          ...product,
          date: Date.now(),
        });
      } else {
        // Ajouter le nouveau produit en première position
        storedProducts.unshift({
          ...product,
          date: Date.now(),
        });
        
        // Limiter à 50 produits maximum
        if (storedProducts.length > 50) {
          storedProducts.pop();
        }
      }
      
      // Sauvegarder la liste mise à jour
      await AsyncStorage.setItem(STORAGE_KEYS.SCANNED_PRODUCTS, JSON.stringify(storedProducts));
      
      // Mettre à jour les compteurs
      await this.updateCounters();
      
      console.log('[ProductStorageService] Produit scanné enregistré avec succès');
    } catch (error) {
      console.error('[ProductStorageService] Erreur lors de l\'enregistrement du produit scanné:', error);
      throw error;
    }
  }
  
  /**
   * Récupère la liste des produits scannés
   * @returns Liste des produits scannés
   */
  static async getScannedProducts(): Promise<Product[]> {
    try {
      const storedProducts = await AsyncStorage.getItem(STORAGE_KEYS.SCANNED_PRODUCTS);
      return storedProducts ? JSON.parse(storedProducts) : [];
    } catch (error) {
      console.error('[ProductStorageService] Erreur lors de la récupération des produits scannés:', error);
      return [];
    }
  }
  
  /**
   * Supprime un produit scanné
   * @param productId ID du produit à supprimer
   */
  static async removeScannedProduct(productId: string): Promise<void> {
    try {
      // Récupérer la liste actuelle
      const storedProducts = await this.getScannedProducts();
      
      // Filtrer le produit à supprimer
      const updatedProducts = storedProducts.filter(p => p.id !== productId);
      
      // Sauvegarder la liste mise à jour
      await AsyncStorage.setItem(STORAGE_KEYS.SCANNED_PRODUCTS, JSON.stringify(updatedProducts));
      
      // Mettre à jour les compteurs
      await this.updateCounters();
      
      console.log('[ProductStorageService] Produit scanné supprimé avec succès');
    } catch (error) {
      console.error('[ProductStorageService] Erreur lors de la suppression du produit scanné:', error);
      throw error;
    }
  }
  
  /**
   * Vérifie si un produit est dans les favoris
   * @param productId ID du produit à vérifier
   * @returns true si le produit est dans les favoris, false sinon
   */
  static async isProductFavorite(productId: string): Promise<boolean> {
    try {
      const favoriteProducts = await this.getFavoriteProducts();
      return favoriteProducts.some(p => p.id === productId);
    } catch (error) {
      console.error('[ProductStorageService] Erreur lors de la vérification du favori:', error);
      return false;
    }
  }
  
  /**
   * Ajoute ou retire un produit des favoris
   * @param product Produit à ajouter/retirer des favoris
   * @returns true si le produit a été ajouté, false s'il a été retiré
   */
  static async toggleFavoriteProduct(product: Product): Promise<boolean> {
    try {
      // Récupérer la liste actuelle
      const favoriteProducts = await this.getFavoriteProducts();
      
      // Vérifier si le produit est déjà dans les favoris
      const existingProductIndex = favoriteProducts.findIndex(p => p.id === product.id);
      
      if (existingProductIndex >= 0) {
        // Retirer le produit des favoris
        favoriteProducts.splice(existingProductIndex, 1);
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_PRODUCTS, JSON.stringify(favoriteProducts));
        await this.updateCounters();
        console.log('[ProductStorageService] Produit retiré des favoris');
        return false;
      } else {
        // Ajouter le produit aux favoris
        favoriteProducts.unshift({
          ...product,
          date: Date.now(),
        });
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_PRODUCTS, JSON.stringify(favoriteProducts));
        await this.updateCounters();
        console.log('[ProductStorageService] Produit ajouté aux favoris');
        return true;
      }
    } catch (error) {
      console.error('[ProductStorageService] Erreur lors de la modification des favoris:', error);
      throw error;
    }
  }
  
  /**
   * Récupère la liste des produits favoris
   * @returns Liste des produits favoris
   */
  static async getFavoriteProducts(): Promise<Product[]> {
    try {
      const storedProducts = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_PRODUCTS);
      return storedProducts ? JSON.parse(storedProducts) : [];
    } catch (error) {
      console.error('[ProductStorageService] Erreur lors de la récupération des produits favoris:', error);
      return [];
    }
  }
  
  /**
   * Supprime un produit des favoris
   * @param productId ID du produit à supprimer
   */
  static async removeFavoriteProduct(productId: string): Promise<void> {
    try {
      // Récupérer la liste actuelle
      const favoriteProducts = await this.getFavoriteProducts();
      
      // Filtrer le produit à supprimer
      const updatedProducts = favoriteProducts.filter(p => p.id !== productId);
      
      // Sauvegarder la liste mise à jour
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_PRODUCTS, JSON.stringify(updatedProducts));
      
      // Mettre à jour les compteurs
      await this.updateCounters();
      
      console.log('[ProductStorageService] Produit favori supprimé avec succès');
    } catch (error) {
      console.error('[ProductStorageService] Erreur lors de la suppression du produit favori:', error);
      throw error;
    }
  }
  
  /**
   * Met à jour les compteurs
   */
  static async updateCounters(): Promise<void> {
    try {
      // Récupérer les listes actuelles
      const scannedProducts = await this.getScannedProducts();
      const favoriteProducts = await this.getFavoriteProducts();
      
      // Créer l'objet compteurs
      const counters = {
        scannedCount: scannedProducts.length,
        favoritesCount: favoriteProducts.length
      };
      
      // Sauvegarder les compteurs
      await AsyncStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
      
      console.log('[ProductStorageService] Compteurs mis à jour:', counters);
    } catch (error) {
      console.error('[ProductStorageService] Erreur lors de la mise à jour des compteurs:', error);
      throw error;
    }
  }
  
  /**
   * Récupère les compteurs
   * @returns Objet contenant les compteurs
   */
  static async getCounters(): Promise<{ scannedCount: number; favoritesCount: number }> {
    try {
      const counters = await AsyncStorage.getItem(STORAGE_KEYS.COUNTERS);
      return counters 
        ? JSON.parse(counters) 
        : { scannedCount: 0, favoritesCount: 0 };
    } catch (error) {
      console.error('[ProductStorageService] Erreur lors de la récupération des compteurs:', error);
      return { scannedCount: 0, favoritesCount: 0 };
    }
  }
} 