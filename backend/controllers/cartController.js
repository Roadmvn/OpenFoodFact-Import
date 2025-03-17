const { Cart, InternalProduct, Product, User } = require('../models');
const jwt = require('jsonwebtoken');
const {where} = require("sequelize");

// 获取用户购物车
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id; // 从 JWT 中获取用户 ID（通过中间件设置 req.user）

        const cartItems = await Cart.findAll({
            where: { userId },
            include: [
                {
                    model: InternalProduct,
                    as: 'internalProduct',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'brand', 'categories', 'image_url'] }],
                },
            ],
        });

        res.status(200).json({
            message: 'Cart items fetched successfully',
            cartItems,
        });
    } catch (error) {
        console.error('Error during fetching cart items:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 添加产品到购物车
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id; // 从 JWT 中获取用户 ID
        const { internalProductId, quantity } = req.body;

        // 验证产品是否存在，同时查询 InternalProduct 和 Product 的详细信息
        const internalProduct = await InternalProduct.findByPk(internalProductId, {
            include: [
                {
                    model: Product,
                    as: 'product', // 确保和模型定义中的别名一致
                    attributes: [
                        'id',
                        'name',
                        'brand',
                        'categories',
                        'image_url',
                        'energy_kcal',
                        'fat',
                        'proteins',
                    ],
                },
            ],
        });

        // 如果未找到产品，返回 404
        if (!internalProduct) {
            return res.status(404).json({ message: 'Product does not exist' });
        }

        // 检查购物车中是否已有该产品
        const existingCartItem = await Cart.findOne({
            where: { userId, internalProductId },
            include: [
                {
                    model: InternalProduct,
                    as: 'internalProduct',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'brand', 'categories', 'image_url'],
                        },
                    ],
                },
            ],
        });

        if (existingCartItem) {
            // 如果购物车中已有该商品，增加数量
            existingCartItem.quantity += quantity || 1;
            await existingCartItem.save();

            // 计算购物车总价
            const totalPrice = await calculateTotalPrice(userId);

            // 发送更新后的购物车项（包含总价）
            return res.status(200).json({
                message: 'Cart item updated successfully',
                cartItem: existingCartItem,
                totalPrice, // 返回总价
            });
        }

        // 如果购物车中不存在该商品，则创建新的购物项
        const cartItem = await Cart.create({
            userId,
            internalProductId,
            quantity: quantity || 1,
        });

        // 查询新增后的购物车项（包含详细信息）
        const newCartItem = await Cart.findOne({
            where: { id: cartItem.id },
            include: [
                {
                    model: InternalProduct,
                    as: 'internalProduct',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'brand', 'categories', 'image_url'],
                        },
                    ],
                },
            ],
        });

        // 计算购物车总价
        const totalPrice = await calculateTotalPrice(userId);

        // 返回创建后的购物车项（包含总价）
        return res.status(201).json({
            message: 'Item added to cart successfully',
            cartItem: newCartItem,
            totalPrice, // 返回总价
        });
    } catch (error) {
        console.error('Error to add a product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 辅助函数：计算用户购物车的总价
async function calculateTotalPrice(userId) {
    try {
        const cartItems = await Cart.findAll({
            where: { userId },
            include: [
                {
                    model: InternalProduct,
                    as: 'internalProduct',
                    attributes: ['price'], // 只需要商品价格
                },
            ],
        });

        // 计算总价
        const totalPrice = cartItems.reduce((sum, item) => {
            return sum + item.quantity * parseFloat(item.internalProduct.price);
        }, 0);

        return totalPrice.toFixed(2); // 返回保留两位小数的总价
    } catch (error) {
        console.error('Error calculating total price:', error);
        throw new Error('Failed to calculate total price');
    }
}

// 更新购物车项目（修改数量）
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id; // 确保用户只能操作自己的购物车
        const { id } = req.params; // 购物车项目 ID
        const { quantity } = req.body;

        const cartItem = await Cart.findOne({
            where: { id, userId },
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found or unauthorized' });
        }

        // 更新数量
        cartItem.quantity = quantity;
        await cartItem.save();

        res.status(200).json({
            message: 'Cart item updated successfully',
            cartItem,
        });
    } catch (error) {
        console.error('Error during updating cart item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 删除购物车中的某个产品
exports.deleteCartItem = async (req, res) => {
    try {
        const userId = req.user.id; // 从 JWT 中获取用户 ID
        const { id } = req.params; // 购物车项目 ID

        const cartItem = await Cart.findOne({
            where: { id, userId },
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found or unauthorized' });
        }

        await cartItem.destroy();

        res.status(200).json({
            message: 'Cart item deleted successfully',
        });
    } catch (error) {
        console.error('Error during deleting cart item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 清空购物车（删除用户所有购物车项目）
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id; // 确保用户只能清空自己的购物车

        await Cart.destroy({
            where: { userId },
        });

        res.status(200).json({
            message: 'Cart cleared successfully',
        });
    } catch (error) {
        console.error('Error during clearing cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};