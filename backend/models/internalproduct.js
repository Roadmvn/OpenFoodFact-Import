'use strict';
const { Model } = require('sequelize');

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