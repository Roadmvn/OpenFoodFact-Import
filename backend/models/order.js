'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            // 关联买家信息
            Order.belongsTo(models.User, {
                foreignKey: 'buyerId',
                as: 'buyer',
            });

            // 关联卖家信息
            Order.belongsTo(models.User, {
                foreignKey: 'sellerId',
                as: 'seller',
            });

            // 关联多个订单项（每个订单包含多个产品）
            Order.hasMany(models.OrderItem, {
                foreignKey: 'orderId',
                as: 'items',
            });
        }
    }

    Order.init(
        {
            buyerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
            },
            sellerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
            },
            totalAmount: {
                type: DataTypes.DECIMAL(10, 2), // 总金额
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('pending', 'completed', 'cancelled'), // 订单状态
                defaultValue: 'pending',
                allowNull: false,
            },
            paypalPayment: {
                type: DataTypes.BOOLEAN, // 是否通过 PayPal 支付
                defaultValue: false,
            },
            paypalTransactionId: {
                type: DataTypes.STRING, // 如果 PayPal 支付成功，记录交易 ID
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Order',
            timestamps: true, // 自动生成 `createdAt` 和 `updatedAt`
        }
    );

    return Order;
};