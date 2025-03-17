'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Cart extends Model {
        static associate(models) {
            // 关联到 User 模型
            Cart.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            // 关联到 InternalProduct 模型
            Cart.belongsTo(models.InternalProduct, { foreignKey: 'internalProductId', as: 'internalProduct' });
        }
    }

    Cart.init(
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            internalProductId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'active',
            },
        },
        {
            sequelize,
            modelName: 'Cart',
        }
    );

    return Cart;
};