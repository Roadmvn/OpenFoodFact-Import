const axios = require('axios');
const Product = require('../models/Product');

class OpenFoodFactsService {
    constructor() {
        this.api = axios.create({
            baseURL: process.env.OFF_API_URL,
            timeout: parseInt(process.env.OFF_TIMEOUT),
            headers: {
                'User-Agent': 'SupermarketAPI - Version 1.0'
            }
        });
    }

    async searchProducts(query, page = 1) {
        try {
            const response = await this.api.get('/search', {
                params: {
                    search_terms: query,
                    page_size: process.env.OFF_BATCH_SIZE,
                    page,
                    json: true
                }
            });

            return response.data;
        } catch (error) {
            console.error('Erreur lors de la recherche OpenFoodFacts:', error.message);
            throw new Error('Erreur lors de la recherche des produits');
        }
    }

    async getProductByBarcode(barcode) {
        try {
            const response = await this.api.get(`/product/${barcode}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du produit:', error.message);
            throw new Error('Produit non trouvé');
        }
    }

    mapProductData(offProduct) {
        return {
            barcode: offProduct.code,
            name: offProduct.product_name_fr || offProduct.product_name,
            brand: offProduct.brands,
            description: offProduct.generic_name_fr || offProduct.generic_name,
            image_url: offProduct.image_url,
            nutrition_grade: offProduct.nutrition_grade_fr,
            ingredients: offProduct.ingredients_text_fr || offProduct.ingredients_text,
            price: 0, // À définir manuellement
            stock: 0  // À définir manuellement
        };
    }

    async importProduct(barcode) {
        try {
            // Vérifier si le produit existe déjà
            const existingProduct = await Product.findByBarcode(barcode);
            if (existingProduct) {
                return { status: 'exists', product: existingProduct };
            }

            // Récupérer les données depuis OpenFoodFacts
            const offData = await this.getProductByBarcode(barcode);
            if (!offData.product) {
                throw new Error('Produit non trouvé sur OpenFoodFacts');
            }

            // Mapper et sauvegarder le produit
            const productData = this.mapProductData(offData.product);
            const productId = await Product.create(productData);
            const newProduct = await Product.findById(productId);

            return { status: 'created', product: newProduct };
        } catch (error) {
            console.error('Erreur lors de l\'import du produit:', error);
            throw error;
        }
    }

    async syncProducts(query) {
        const results = {
            imported: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };

        try {
            const searchResults = await this.searchProducts(query);
            const products = searchResults.products || [];

            for (const product of products) {
                try {
                    if (!product.code) continue;

                    const importResult = await this.importProduct(product.code);
                    if (importResult.status === 'created') {
                        results.imported++;
                    } else {
                        results.skipped++;
                    }
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        barcode: product.code,
                        error: error.message
                    });
                }
            }

            return results;
        } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
            throw error;
        }
    }
}

module.exports = new OpenFoodFactsService();
