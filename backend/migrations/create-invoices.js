'use strict';
const { Model } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 创建 Invoices 表
        await queryInterface.createTable('Invoices', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            orderId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Orders', // 必须与 Order 表的表名一致
                    key: 'id',
                },
                onDelete: 'CASCADE', // 当订单被删除时，自动删除关联的发票
                onUpdate: 'CASCADE',
            },
            invoiceNumber: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true, // 发票编号唯一
            },
            totalAmount: {
                type: Sequelize.DECIMAL(10, 2), // 支持小数金额
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('paid', 'unpaid', 'processing'),
                allowNull: false,
                defaultValue: 'unpaid',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        // 删除 Invoices 表
        await queryInterface.dropTable('Invoices');
    },
};