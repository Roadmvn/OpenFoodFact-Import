import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  barcode: string;
  productName: string;
  brand: string;
  imageUrl: string;
  quantity: number;
  price: number; // À définir plus tard si nécessaire
  internalProductId: number; // ID du produit interne
  sellerId: number; // ID du vendeur
}

class CartService {
  private static CART_STORAGE_KEY = 'trinity_cart';

  // Ajouter un produit au panier
  static async addToCart(item: CartItem): Promise<void> {
    try {
      // Récupérer le panier actuel
      const currentCart = await this.getCart();
      
      // Vérifier si le produit est déjà dans le panier
      const existingItemIndex = currentCart.findIndex(
        cartItem => cartItem.barcode === item.barcode
      );
      
      if (existingItemIndex !== -1) {
        // Si le produit existe déjà, augmenter la quantité
        currentCart[existingItemIndex].quantity += item.quantity;
      } else {
        // Sinon, ajouter le nouveau produit
        currentCart.push(item);
      }
      
      // Sauvegarder le panier mis à jour
      await AsyncStorage.setItem(
        this.CART_STORAGE_KEY,
        JSON.stringify(currentCart)
      );
      
      console.log('Produit ajouté au panier:', item.productName);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      throw error;
    }
  }

  // Récupérer le contenu du panier
  static async getCart(): Promise<CartItem[]> {
    try {
      const cartData = await AsyncStorage.getItem(this.CART_STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
      return [];
    }
  }

  // Supprimer un produit du panier
  static async removeFromCart(barcode: string): Promise<void> {
    try {
      const currentCart = await this.getCart();
      const updatedCart = currentCart.filter(item => item.barcode !== barcode);
      
      await AsyncStorage.setItem(
        this.CART_STORAGE_KEY,
        JSON.stringify(updatedCart)
      );
      
      console.log('Produit supprimé du panier');
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      throw error;
    }
  }

  // Mettre à jour la quantité d'un produit
  static async updateQuantity(barcode: string, quantity: number): Promise<void> {
    try {
      const currentCart = await this.getCart();
      const itemIndex = currentCart.findIndex(item => item.barcode === barcode);
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          // Si la quantité est 0 ou moins, supprimer le produit
          await this.removeFromCart(barcode);
        } else {
          // Sinon, mettre à jour la quantité
          currentCart[itemIndex].quantity = quantity;
          await AsyncStorage.setItem(
            this.CART_STORAGE_KEY,
            JSON.stringify(currentCart)
          );
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      throw error;
    }
  }

  // Vider le panier
  static async clearCart(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CART_STORAGE_KEY);
      console.log('Panier vidé');
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
      throw error;
    }
  }
}

export default CartService;