'use strict';
const { Model } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     InternalProduct:
 *       type: object
 *       required:
 *         - sellerId
 *         - productId
 *         - price
 *         - quantity
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique du produit interne
 *         sellerId:
 *           type: integer
 *           description: Identifiant du vendeur
 *         productId:
 *           type: integer
 *           description: Identifiant du produit OpenFoodFact
 *         price:
 *           type: number
 *           format: decimal
 *           description: Prix du produit
 *         quantity:
 *           type: integer
 *           description: Quantité disponible
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour
 */
module.exports = (sequelize, DataTypes) => {
    class InternalProduct extends Model {
        static associate(models) {
            // 关联到 User（卖家）
            InternalProduct.belongsTo(models.User, {
                foreignKey: 'sellerId',
                as: 'seller',
            });

            // 关联到 Product
            InternalProduct.belongsTo(models.Product, {
                foreignKey: 'productId',
                as: 'product',
            });
        }
    }

    InternalProduct.init(
        {
            sellerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users', // 表名
                    key: 'id', // 外键
                },
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Products', // 表名
                    key: 'id', // 外键
                },
            },
            price: {
                type: DataTypes.DECIMAL(10, 2), // 自定义价格
                allowNull: false,
            },
            quantity: {
                type: DataTypes.INTEGER, // 自定义数量
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'InternalProduct',
            timestamps: true, // 自动生成 createdAt 和 updatedAt
        }
    );

    return InternalProduct;
};