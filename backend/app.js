const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const csurf = require('csurf');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const app = express();

// Configuration du port
const PORT = 3001;

// Configuration CORS pour permettre l'accès depuis l'app mobile
app.use(cors({
    origin: function(origin, callback) {
        // Liste des origines autorisées
        const allowedOrigins = [
            // URLs locales
            // `http://localhost:${PORT}`,
            // `http://10.0.2.2:${PORT}`,
            'http://localhost:19006',  // Expo
            'http://localhost:19000',  // Expo
            'http://localhost:3000',   // Frontend React
            'http://10.0.2.2:19000',  // Expo sur Android
            // 'http://10.68.248.10:8081', // Votre IP Expo
            // 'exp://10.68.248.10:8081', // Votre IP Expo en format exp
            // Pour le mode tunnel
            // /^https:\/\/.*\.expo\.dev$/,     // URLs Expo tunnel
            // /^exp:\/\/.*$/                   // URLs Expo Go
        ];

        // Autoriser les requêtes sans origine (comme les apps mobiles)
        if (!origin) return callback(null, true);

        // Vérifier si l'origine est autorisée
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin);
            }
            return allowedOrigin === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('Origine non autorisée:', origin);
            callback(null, true); // En développement, on autorise quand même
        }
    },
    credentials: true
}));

// Synchronisation de la base de données
sequelize.sync().then(() => {
    console.log('Base de données synchronisée avec succès');
    
    const sessionStore = new SequelizeStore({
        db: sequelize,
    });

    sessionStore.sync();

    app.use(
        session({
            secret: 'JMsgmBe7nbZqw59OPO',
            store: sessionStore,
            resave: false,
            saveUninitialized: false,
        })
    );

    app.use('/static', express.static('public'));
    app.use(express.json());
    app.use(bodyParser.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Configuration de Swagger
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
        explorer: true,
        swaggerOptions: {
            docExpansion: 'none' // Toutes les sections sont fermées par défaut
        }
    }));

    // Configuration des routes
    app.use('/auth', authRoutes);
    app.use('/api', routes);

    // Gestion des routes non trouvées
    app.use((req, res, next) => {
        res.status(404).json({ message: 'La ressource demandée n\'a pas été trouvée！' });
    });

    // Gestion globale des erreurs
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ message: 'Erreur interne du serveur！' });
    });

    // Démarrage du serveur
    const server = app.listen(PORT, () => {
        console.log(`Le serveur est en cours d'exécution sur : http://localhost:${PORT}`);
        console.log(`Pour Android, utilisez : http://10.0.2.2:${PORT}`);
        console.log(`Documentation API Swagger : http://localhost:${PORT}/api-docs`);
    });
        
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Le port ${PORT} est déjà utilisé`);
        } else {
            console.error(`Erreur sur le port ${PORT}:`, error);
        }
    });
}).catch((error) => {
    console.error('Erreur lors de la synchronisation de la base de données:', error);
});