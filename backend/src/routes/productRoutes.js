const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    updateStock
} = require('../controllers/productController');

// Routes publiques
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Routes protégées (admin uniquement)
router.post('/', authenticate, authorize('admin'), createProduct);
router.put('/:id', authenticate, authorize('admin'), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);
router.patch('/:id/stock', authenticate, authorize('admin'), updateStock);

module.exports = router;
