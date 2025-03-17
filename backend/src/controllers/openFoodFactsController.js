const openFoodFactsService = require('../services/openFoodFactsService');

const importProduct = async (req, res) => {
    try {
        const { barcode } = req.params;
        if (!barcode) {
            return res.status(400).json({ message: 'Code-barres requis' });
        }

        const result = await openFoodFactsService.importProduct(barcode);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const syncProducts = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Terme de recherche requis' });
        }

        const results = await openFoodFactsService.syncProducts(query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const searchProducts = async (req, res) => {
    try {
        const { query, page = 1 } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Terme de recherche requis' });
        }

        const results = await openFoodFactsService.searchProducts(query, parseInt(page));
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    importProduct,
    syncProducts,
    searchProducts
};
