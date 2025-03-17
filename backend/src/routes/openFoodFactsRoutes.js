const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
    importProduct,
    syncProducts,
    searchProducts
} = require('../controllers/openFoodFactsController');

// Routes protégées (admin uniquement)
router.get('/search', auth, isAdmin, searchProducts);
router.post('/import/:barcode', auth, isAdmin, importProduct);
router.post('/sync', auth, isAdmin, syncProducts);

module.exports = router;
