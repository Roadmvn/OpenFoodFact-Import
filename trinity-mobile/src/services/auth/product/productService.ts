import axios from 'axios';

const OPENFOODFACTS_API_URL = 'https://world.openfoodfacts.org/api/v0';

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

class ProductService {
  static async getProductByBarcode(barcode: string): Promise<ProductData> {
    try {
      console.log(`Recherche du produit avec le code-barres: ${barcode}`);
      const response = await axios.get(`${OPENFOODFACTS_API_URL}/product/${barcode}.json`);
      
      if (response.data.status === 0) {
        throw new Error('Produit non trouvé');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données du produit:', error);
      throw error;
    }
  }
}

export default ProductService;