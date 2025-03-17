'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Contact extends Model {
        static associate(models) {
            // 关联买家信息
            Contact.belongsTo(models.User, {
                foreignKey: 'buyerId',
                as: 'buyer',
            });

            // 关联卖家信息
            Contact.belongsTo(models.User, {
                foreignKey: 'sellerId',
                as: 'seller',
            });
        }
    }

    Contact.init(
        {
            buyerId: {
                type: DataTypes.INTEGER,
                allowNull: false, // 强制要求买家 ID 存在
                references: {
                    model: 'Users',
                    key: 'id',
                },
            },
            sellerId: {
                type: DataTypes.INTEGER,
                allowNull: false, // 强制要求卖家 ID 存在
                references: {
                    model: 'Users',
                    key: 'id',
                },
            },
            message: {
                type: DataTypes.TEXT, // 联系的消息正文
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('pending', 'resolved', 'closed'), // 联系状态
                defaultValue: 'pending',
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Contact',
            timestamps: true, // 自动生成 `createdAt` 和 `updatedAt`
        }
    );

    return Contact;
};