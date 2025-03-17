const Product = require('../models/Product');
const Category = require('../models/Category');

const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category_id } = req.query;
        const result = await Product.findAll({
            page: parseInt(page),
            limit: parseInt(limit),
            category_id: category_id ? parseInt(category_id) : null
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        if (req.body.category_id) {
            const category = await Category.findById(req.body.category_id);
            if (!category) {
                return res.status(400).json({ message: 'Catégorie non trouvée' });
            }
        }

        const productId = await Product.create(req.body);
        const product = await Product.findById(productId);
        
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        if (req.body.category_id) {
            const category = await Category.findById(req.body.category_id);
            if (!category) {
                return res.status(400).json({ message: 'Catégorie non trouvée' });
            }
        }

        await Product.update(req.params.id, req.body);
        const updatedProduct = await Product.findById(req.params.id);
        
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        await Product.delete(req.params.id);
        res.json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Paramètre de recherche manquant' });
        }

        const products = await Product.search(q);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateStock = async (req, res) => {
    try {
        const { quantity } = req.body;
        if (typeof quantity !== 'number') {
            return res.status(400).json({ message: 'Quantité invalide' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        await Product.updateStock(req.params.id, quantity);
        const updatedProduct = await Product.findById(req.params.id);
        
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    updateStock
};
