const Joi = require('joi');

const schemas = {
    // Validation d'utilisateur
    userRegister: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        firstName: Joi.string().min(2).required(),
        lastName: Joi.string().min(2).required(),
        phone: Joi.string().pattern(/^[0-9+]{10,}$/).required()
    }),

    userLogin: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    // Validation de produit
    product: Joi.object({
        name: Joi.string().min(2).required(),
        description: Joi.string().min(10).required(),
        price: Joi.number().positive().required(),
        stock: Joi.number().integer().min(0).required(),
        category_id: Joi.number().integer().positive().required(),
        brand: Joi.string().required(),
        barcode: Joi.string(),
        image_url: Joi.string().uri()
    }),

    // Validation de commande
    order: Joi.object({
        items: Joi.array().items(
            Joi.object({
                product_id: Joi.number().integer().positive().required(),
                quantity: Joi.number().integer().positive().required()
            })
        ).min(1).required()
    }),

    // Validation de paiement
    payment: Joi.object({
        order_id: Joi.number().integer().positive().required(),
        payment_method: Joi.string().valid('card').required()
    }),

    // Validation de remboursement
    refund: Joi.object({
        order_id: Joi.number().integer().positive().required(),
        amount: Joi.number().positive().optional(),
        reason: Joi.string().min(10).required()
    }),

    // Validation de catégorie
    category: Joi.object({
        name: Joi.string().min(2).required(),
        description: Joi.string().min(10).optional(),
        parent_id: Joi.number().integer().positive().optional()
    }),

    // Validation de pagination
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    })
};

module.exports = schemas;
