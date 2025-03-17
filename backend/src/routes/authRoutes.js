const express = require('express');
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes protégées
router.use(authenticate);
router.get('/me', getMe);
router.post('/change-password', changePassword);

module.exports = router;
