const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware d'authentification
const authenticate = async (req, res, next) => {
    try {
        // Vérifier si le token est présent
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        // Extraire et vérifier le token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Vérifier si l'utilisateur existe toujours
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        // Ajouter l'utilisateur à la requête
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token invalide' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expiré' });
        }
        next(error);
    }
};

// Middleware de vérification des rôles
const authorize = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }
        next();
    };
};

module.exports = {
    authenticate,
    authorize
};
