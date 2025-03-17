'use strict';
const { Model } = require('sequelize');

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