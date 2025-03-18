'use strict';
const { Model } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique de l'utilisateur
 *         firstName:
 *           type: string
 *           description: Prénom de l'utilisateur
 *         lastName:
 *           type: string
 *           description: Nom de l'utilisateur
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'utilisateur (unique)
 *         password:
 *           type: string
 *           format: password
 *           description: Mot de passe de l'utilisateur (hashé)
 *         phone:
 *           type: string
 *           description: Numéro de téléphone de l'utilisateur
 *         address:
 *           type: string
 *           description: Adresse de l'utilisateur
 *         zipCode:
 *           type: string
 *           description: Code postal de l'utilisateur
 *         city:
 *           type: string
 *           description: Ville de l'utilisateur
 *         country:
 *           type: string
 *           description: Pays de l'utilisateur
 *         role:
 *           type: string
 *           enum: [admin, seller, buyer]
 *           description: Rôle de l'utilisateur (admin, seller, buyer)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du compte
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour du compte
 *       example:
 *         firstName: Jean
 *         lastName: Dupont
 *         email: jean.dupont@example.com
 *         password: motdepasse123
 *         phone: "0123456789"
 *         address: "123 rue de Paris"
 *         zipCode: "75001"
 *         city: "Paris"
 *         country: "France"
 *         role: buyer
 */
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