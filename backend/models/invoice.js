'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Invoice extends Model {
        /**
         * 模型关联设置
         */
        static associate(models) {
            // 发票关联到订单
            Invoice.belongsTo(models.Order, {
                foreignKey: 'orderId',
                as: 'order', // 发票关联订单
                onDelete: 'CASCADE', // 订单被删除时，自动删除相关联的发票
                onUpdate: 'CASCADE',
            });

            // 如果需要，也可以关联创建发票的管理员或用户
            // Invoice.belongsTo(models.User, {
            //     foreignKey: 'createdBy',
            //     as: 'creator'
            // });
        }
    }

    Invoice.init(
        {
            orderId: {
                type: DataTypes.INTEGER, // 外键，关联订单表的 ID
                allowNull: false,
                references: {
                    model: 'Orders', // `Orders` 表
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            invoiceNumber: {
                type: DataTypes.STRING, // 唯一的发票编号
                allowNull: false,
                unique: true,
            },
            totalAmount: {
                type: DataTypes.DECIMAL(10, 2), // 发票总额，与订单对齐
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('pending', 'paid', 'cancelled'), // 发票状态
                defaultValue: 'pending', // 默认未支付
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE, // 发票创建时间
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE, // 发票更新时间
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'Invoice',
            tableName: 'Invoices', // 数据库表名为 `Invoices`
            timestamps: true, // 自动生成 `createdAt` 和 `updatedAt`
        }
    );

    return Invoice;
};