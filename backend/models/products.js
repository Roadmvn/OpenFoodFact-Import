'use strict';
const { Model } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - brand
 *         - categories
 *         - labels
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique du produit
 *         code:
 *           type: string
 *           description: Code-barres du produit
 *         name:
 *           type: string
 *           description: Nom du produit
 *         brand:
 *           type: string
 *           description: Marque du produit
 *         categories:
 *           type: string
 *           description: Catégories du produit
 *         labels:
 *           type: string
 *           description: Labels du produit
 *         quantity:
 *           type: string
 *           description: Quantité du produit
 *         image_url:
 *           type: string
 *           description: URL de l'image du produit
 *         image_nutrition_url:
 *           type: string
 *           description: URL de l'image nutritionnelle du produit
 *         energy_kcal:
 *           type: number
 *           format: float
 *           description: Valeur énergétique en kcal
 *         fat:
 *           type: number
 *           format: float
 *           description: Teneur en matières grasses
 *         saturated_fat:
 *           type: number
 *           format: float
 *           description: Teneur en acides gras saturés
 *         sugars:
 *           type: number
 *           format: float
 *           description: Teneur en sucres
 *         salt:
 *           type: number
 *           format: float
 *           description: Teneur en sel
 *         proteins:
 *           type: number
 *           format: float
 *           description: Teneur en protéines
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du produit
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour du produit
 *       example:
 *         code: "3017620422003"
 *         name: "Nutella"
 *         brand: "Ferrero"
 *         categories: "Petit-déjeuners, Produits à tartiner, Pâtes à tartiner, Pâtes à tartiner au chocolat, Pâtes à tartiner aux noisettes"
 *         labels: "Sans colorants, Sans conservateurs"
 *         quantity: "400g"
 *         image_url: "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.288.400.jpg"
 *         energy_kcal: 539
 *         fat: 30.9
 *         saturated_fat: 10.6
 *         sugars: 56.3
 *         salt: 0.107
 *         proteins: 6.3
 */
module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            Product.hasMany(models.InternalProduct, {
                foreignKey: 'productId',
                as: 'InternalProduct',
            });
        }
    }

    Product.init(
        {
            code: {
                type: DataTypes.STRING(255),
                unique: true,
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: 'Unknown',
            },
            brand: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: 'Unknown',
            },
            categories: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: 'Unknown',
                get() {
                    const value = this.getDataValue('categories');
                    return value ? value : 'Unknown';
                },
                set(value) {
                    this.setDataValue('categories', value ? value : 'Unknown');
                }
            },
            labels: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: 'None',
            },
            quantity: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            image_url: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            image_nutrition_url: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            energy_kcal: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            fat: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            saturated_fat: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            sugars: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            salt: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            proteins: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Product',
            timestamps: true,
        }
    );

    return Product;
};