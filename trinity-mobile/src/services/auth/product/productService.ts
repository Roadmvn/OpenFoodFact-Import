import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../config/api';

const OPENFOODFACTS_API_URL = 'https://world.openfoodfacts.org/api/v0';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
const REQUEST_TIMEOUT = 10000; // 10 secondes de timeout

export interface ProductData {
  code: string;
  product: {
    product_name: string;
    brands: string;
    image_url: string;
    nutriments: {
      energy_100g: number;
      fat_100g: number;
      saturated_fat_100g: number;
      carbohydrates_100g: number;
      sugars_100g: number;
      proteins_100g: number;
      salt_100g: number;
      [key: string]: any;
    };
    nutriscore_grade?: string;
    ecoscore_grade?: string;
    ingredients_text?: string;
    [key: string]: any;
  };
  status: number;
  status_verbose: string;
}

export interface InternalProductData {
  id: number;
  barcode: string;
  name: string;
  price: number;
  sellerId: number;
  sellerName: string;
  available: boolean;
  stock: number;
}

class ProductService {
  static async getProductByBarcode(barcode: string): Promise<ProductData> {
    try {
      // Vérifier d'abord dans le cache
      const cachedData = await this.getFromCache(barcode);
      if (cachedData) {
        console.log(`Produit récupéré du cache: ${barcode}`);
        return cachedData;
      }
      
      console.log(`Recherche du produit avec le code-barres: ${barcode}`);
      
      // Créer une requête avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      const response = await axios.get(`${OPENFOODFACTS_API_URL}/product/${barcode}.json`, {
        signal: controller.signal,
        timeout: REQUEST_TIMEOUT
      });
      
      clearTimeout(timeoutId);
      
      if (response.data.status === 0) {
        throw new Error('Produit non trouvé');
      }
      
      // Sauvegarder dans le cache
      await this.saveToCache(barcode, response.data);
      
      return response.data;
    } catch (error: any) {
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        console.error('Timeout lors de la récupération des données du produit');
        throw new Error('La requête a pris trop de temps. Veuillez réessayer.');
      }
      console.error('Erreur lors de la récupération des données du produit:', error);
      throw error;
    }
  }
  
  /**
   * Vérifie si un produit avec le code-barres donné est disponible dans notre système interne
   * et récupère ses informations (prix, ID, vendeur, etc.)
   * @param barcode Le code-barres du produit à vérifier
   * @returns Les données du produit interne ou null si le produit n'est pas disponible
   */
  static async checkInternalProduct(barcode: string): Promise<InternalProductData | null> {
    try {
      console.log(`Vérification du produit interne avec le code-barres: ${barcode}`);
      
      // MODE DÉVELOPPEMENT: Retourner des données fictives pour les tests
      // À remplacer par l'appel API réel quand le backend sera prêt
      const isDev = true; // Mettre à false pour utiliser l'API réelle
      
      if (isDev) {
        console.log(`MODE DEV: Génération de données fictives pour le produit: ${barcode}`);
        
        // Simuler un délai de réseau
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Générer un prix aléatoire entre 1.99 et 29.99
        const price = parseFloat((Math.random() * 28 + 1.99).toFixed(2));
        
        return {
          id: parseInt(barcode.substring(barcode.length - 5)) || 1,
          barcode: barcode,
          name: "Produit test",
          price: price,
          sellerId: 1,
          sellerName: "Vendeur test",
          available: true,
          stock: 10
        };
      }
      
      // Code original pour l'appel API réel
      const response = await axios.get(`${API_URL}/products/check/${barcode}`);
      
      if (response.status === 200 && response.data) {
        console.log(`Produit interne trouvé: ${barcode}`, response.data);
        return response.data;
      } else {
        console.log(`Aucun produit interne trouvé pour le code-barres: ${barcode}`);
        return null;
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification du produit interne: ${barcode}`, error);
      
      // En cas d'erreur en mode développement, retourner quand même des données fictives
      if (true) { // Mode développement forcé pour les tests
        console.log(`MODE DEV (après erreur): Génération de données fictives pour le produit: ${barcode}`);
        const price = parseFloat((Math.random() * 28 + 1.99).toFixed(2));
        
        return {
          id: parseInt(barcode.substring(barcode.length - 5)) || 1,
          barcode: barcode,
          name: "Produit test",
          price: price,
          sellerId: 1,
          sellerName: "Vendeur test",
          available: true,
          stock: 10
        };
      }
      
      return null;
    }
  }
  
  private static async getFromCache(barcode: string): Promise<ProductData | null> {
    try {
      const cacheKey = `product_${barcode}`;
      const cachedItem = await AsyncStorage.getItem(cacheKey);
      
      if (cachedItem) {
        const { data, timestamp } = JSON.parse(cachedItem);
        const now = new Date().getTime();
        
        // Vérifier si le cache est encore valide
        if (now - timestamp < CACHE_EXPIRY) {
          return data;
        } else {
          // Supprimer le cache expiré
          await AsyncStorage.removeItem(cacheKey);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }
  
  private static async saveToCache(barcode: string, data: ProductData): Promise<void> {
    try {
      const cacheKey = `product_${barcode}`;
      const cacheData = {
        data,
        timestamp: new Date().getTime()
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans le cache:', error);
    }
  }
}

export default ProductService;