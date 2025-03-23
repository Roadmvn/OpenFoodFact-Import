const axios = require("axios");
const { Product } = require("../models");

const INITIAL_DELAY = 2000; // 2 secondes
const MAX_RETRY_COUNT = 5;
const PAGE_SIZE = 50; // Réduit de 100 à 50

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const exponentialBackoff = (retryCount) => {
    return Math.min(INITIAL_DELAY * Math.pow(2, retryCount), 30000); // Max 30 secondes
};

const fetchAndInsertProducts = async (page = 1, retryCount = 0) => {
    try {
        console.log(`Récupération de la page ${page}...`);
        
        // Attente entre chaque requête pour respecter les limites
        await delay(1000);

        const { data } = await axios.get(
            `https://world.openfoodfacts.org/cgi/search.pl?search_terms=&page_size=${PAGE_SIZE}&page=${page}&json=true`,
            {
                headers: {
                    "User-Agent": "TrinityApp - Projet éducatif - Contact: votre@email.com",
                },
            }
        );

        const products = data.products;

        if (!products || products.length === 0) {
            console.log("Plus de produits à importer.");
            return;
        }

        for (const product of products) {
            try {
                const productData = {
                    code: product.code || null,
                    barcode: product.code || null, // Utilisation du même code comme code-barres
                    name: product.product_name || "Unknown",
                    brand: product.brands || "Unknown",
                    categories: product.categories || "Unknown",
                    labels: product.labels || "None",
                    quantity: product.quantity || null,
                    image_url: product.image_url || null,
                    image_nutrition_url: product.image_nutrition_url || null,
                    energy_kcal: product.nutriments?.energy_kcal || null,
                    fat: product.nutriments?.fat || null,
                    saturated_fat: product.nutriments?.saturated_fat || null,
                    sugars: product.nutriments?.sugars || null,
                    salt: product.nutriments?.salt || null,
                    proteins: product.nutriments?.proteins || null
                };

                console.log(`Insertion du produit: ${productData.code || 'Sans code'}`);
                await Product.create(productData);
                console.log(`Produit inséré avec succès: ${productData.code || 'Sans code'}`);
            } catch (productError) {
                console.error('Erreur lors de l\'insertion du produit:', {
                    code: product.code,
                    error: productError.message,
                    validationErrors: productError.errors
                });
                continue;
            }
        }

        console.log(`Page ${page} importée avec succès`);
        await delay(2000); // Pause entre les pages
        await fetchAndInsertProducts(page + 1);
    } catch (error) {
        if (error.response?.status === 429) {
            console.log(`Limite de requêtes atteinte. Attente avant nouvelle tentative...`);
            const waitTime = exponentialBackoff(retryCount);
            console.log(`Attente de ${waitTime/1000} secondes...`);
            
            if (retryCount < MAX_RETRY_COUNT) {
                await delay(waitTime);
                return fetchAndInsertProducts(page, retryCount + 1);
            } else {
                console.error("Nombre maximum de tentatives atteint. Arrêt de l'importation.");
                process.exit(1);
            }
        }

        console.error(`Erreur lors de l'importation de la page ${page}:`, {
            message: error.message,
            status: error.response?.status,
            details: error.response?.data || error
        });
        
        if (retryCount < MAX_RETRY_COUNT) {
            const waitTime = exponentialBackoff(retryCount);
            console.log(`Nouvelle tentative dans ${waitTime/1000} secondes (${retryCount + 1}/${MAX_RETRY_COUNT})...`);
            await delay(waitTime);
            return fetchAndInsertProducts(page, retryCount + 1);
        } else {
            console.error("Nombre maximum de tentatives atteint. Arrêt de l'importation.");
            process.exit(1);
        }
    }
};

console.log("Début de l'importation des produits OpenFoodFacts...");
fetchAndInsertProducts()
    .then(() => {
        console.log("Importation terminée !");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Erreur fatale:", error);
        process.exit(1);
    });