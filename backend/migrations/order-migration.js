'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Orders', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            buyerId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users', // 对应的表名
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            sellerId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            totalAmount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending',
            },
            paypalPayment: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            paypalTransactionId: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Orders');
    },
};