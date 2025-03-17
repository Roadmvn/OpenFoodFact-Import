const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

// Schémas de validation
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required()
        .messages({
            'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
        }),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    role: Joi.string().valid('client', 'admin').default('client')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstname
 *               - lastname
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum:
 *                   - client
 *                   - admin
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Email déjà utilisé
 */
const register = async (req, res, next) => {
    try {
        // Valider les données
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        // Vérifier si l'email existe déjà
        const existingUser = await User.findByEmail(value.email);
        if (existingUser) {
            throw new AppError('Cet email est déjà utilisé', 409);
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(value.password, 10);

        // Créer l'utilisateur
        const user = await User.create({
            ...value,
            password: hashedPassword
        });

        // Générer le token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Envoyer la réponse
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Email ou mot de passe incorrect
 */
const login = async (req, res, next) => {
    try {
        // Valider les données
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        // Trouver l'utilisateur
        const user = await User.findByEmail(value.email);
        logger.info('User found:', user);
        
        if (!user) {
            throw new AppError('Email ou mot de passe incorrect', 401);
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(value.password, user.password);
        logger.info('Password comparison:', { 
            provided: value.password,
            stored: user.password,
            isValid: isPasswordValid 
        });
        
        if (!isPasswordValid) {
            throw new AppError('Email ou mot de passe incorrect', 401);
        }

        // Générer le token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Envoyer la réponse
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtenir les informations de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur
 *       401:
 *         description: Non authentifié
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            throw new AppError('Utilisateur non trouvé', 404);
        }

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    role: user.role
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Changer le mot de passe
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Mot de passe actuel incorrect
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Valider le nouveau mot de passe
        const { error } = Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .validate(newPassword);

        if (error) {
            throw new AppError('Le nouveau mot de passe ne respecte pas les critères de sécurité', 400);
        }

        // Trouver l'utilisateur
        const user = await User.findById(req.user.id);
        if (!user) {
            throw new AppError('Utilisateur non trouvé', 404);
        }

        // Vérifier l'ancien mot de passe
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new AppError('Mot de passe actuel incorrect', 401);
        }

        // Hasher et mettre à jour le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update(user.id, { password: hashedPassword });

        res.json({
            status: 'success',
            message: 'Mot de passe modifié avec succès'
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    changePassword
};
