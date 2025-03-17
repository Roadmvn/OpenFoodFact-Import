'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Contacts', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            buyerId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users', // 关联到 Users 表
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE', // 如果 User 被删除，则删除相关 Contact
            },
            sellerId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users', // 关联到 Users 表
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE', // 如果 User 被删除，则删除相关 Contact
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false, // 消息正文不能为 NULL
            },
            status: {
                type: Sequelize.ENUM('pending', 'resolved', 'closed'), // 设置状态
                defaultValue: 'pending', // 默认为 `pending`
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE, // 自动生成 `createdAt` 时间戳
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                type: Sequelize.DATE, // 自动生成 `updatedAt` 时间戳
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        // 删除 ENUM 类型时需先删除关联表
        await queryInterface.dropTable('Contacts'); // 删除 Contacts 表
    },
};