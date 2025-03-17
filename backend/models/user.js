'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.InternalProduct, {
                foreignKey: 'sellerId',
                as: 'InternalProduct',
            });
        }
    }

    User.init(
        {
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            zipCode: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            city: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            country: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            role: {
                type: DataTypes.ENUM('admin', 'seller', 'buyer'), // 限制角色枚举
                allowNull: false, // 不允许为空
                defaultValue: 'buyer', // 默认为买家
            },
            googleId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'User',

            // 默认 Scope 隐藏密码
            defaultScope: {
                attributes: { exclude: ['password'] }, // 默认不返回密码字段
            },

            // 自定义 Scope 如果需要使用密码
            scopes: {
                withPassword: {
                    attributes: { include: ['password'] }, // 明确包括密码
                },
            },
        }
    );

    return User;
};