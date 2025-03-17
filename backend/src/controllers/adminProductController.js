const Product = require('../models/Product');
const openFoodFactsService = require('../services/openFoodFactsService');
const db = require('../config/database');
const { logger } = require('../utils/logger');

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        const allowedUpdates = [
            'name',
            'description',
            'price',
            'stock',
            'category_id',
            'brand',
            'image_url',
            'ingredients',
            'nutrition_facts',
            'allergens',
            'active'
        ];

        const validUpdates = {};
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                validUpdates[key] = updates[key];
            }
        });

        await Product.update(id, validUpdates);
        const updatedProduct = await Product.findById(id);
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        await Product.update(id, { active: !product.active });
        res.json({ message: 'Statut du produit mis à jour avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const refreshProductFromOFF = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        if (!product.barcode) {
            return res.status(400).json({ message: 'Ce produit n\'a pas de code-barres associé' });
        }

        const offData = await openFoodFactsService.getProductByBarcode(product.barcode);
        
        if (!offData) {
            return res.status(404).json({ message: 'Produit non trouvé sur OpenFoodFacts' });
        }

        const updates = {
            name: offData.name,
            brand: offData.brand,
            image_url: offData.image_url,
            ingredients: offData.ingredients,
            nutrition_facts: offData.nutrition_facts,
            allergens: offData.allergens
        };

        await Product.update(id, updates);
        const updatedProduct = await Product.findById(id);
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Vérifier si le produit existe
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Produit non trouvé'
            });
        }

        // Supprimer le produit
        const [result] = await db.query(
            'DELETE FROM products WHERE id = ?',
            [id]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({
                status: 'success',
                message: 'Produit supprimé avec succès'
            });
        } else {
            res.status(404).json({
                status: 'fail',
                message: 'Produit non trouvé'
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateProduct,
    toggleProductStatus,
    refreshProductFromOFF,
    deleteProduct
};
