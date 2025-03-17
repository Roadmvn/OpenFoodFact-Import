const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
    updateProduct,
    toggleProductStatus,
    refreshProductFromOFF,
    deleteProduct
} = require('../controllers/adminProductController');

// Toutes les routes nécessitent d'être admin
router.use(authenticate);
router.use(authorize('admin'));

// Routes de gestion des produits
router.put('/products/:id', updateProduct);
router.patch('/products/:id/toggle', toggleProductStatus);
router.post('/products/:id/refresh', refreshProductFromOFF);
router.delete('/products/:id', deleteProduct);

module.exports = router;
