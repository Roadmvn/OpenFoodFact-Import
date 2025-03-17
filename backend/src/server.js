require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerDefinition = require('../swaggerDef');
const cookieParser = require('cookie-parser');
const { xssProtection, sanitizeData, securityHeaders } = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminProductRoutes = require('./routes/adminProductRoutes');

const app = express();

// Documentation Swagger
const specs = swaggerJsdoc({
    swaggerDefinition,
    apis: ['./src/routes/*.js', './src/models/*.js'],
});

// Middleware de base
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(xssProtection);
app.use(sanitizeData);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminProductRoutes);

// Documentation API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true
}));

// Gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;
