'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class OrderItem extends Model {
        static associate(models) {
            // 关联到 Order（订单）
            OrderItem.belongsTo(models.Order, {
                foreignKey: 'orderId', // 外键链接到 Orders 表
                as: 'order',
            });

            // 关联到 InternalProduct（产品详情）
            OrderItem.belongsTo(models.InternalProduct, {
                foreignKey: 'internalProductId', // 外键链接到 InternalProducts 表
                as: 'internalProduct',
            });
        }
    }

    OrderItem.init(
        {
            orderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Orders', // Orders 表
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            internalProductId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'InternalProducts', // InternalProducts 表
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            unitPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            subtotal: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'OrderItem',
            timestamps: true,
        }
    );

    return OrderItem;
};