const { Order, OrderItem, InternalProduct, User, Product } = require('../models');

// 创建订单和订单项
const createOrder = async (req, res) => {
    const { items, paypalTransactionId } = req.body; // 从请求体中获取订单数据

    try {
        // 从 JWT 解码中提取 buyerId
        const buyerId = req.user.id;

        // 校验 items 是否有效
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items are required and should be a non-empty array." });
        }

        // 根据 internalProductId 查询产品获取 sellerId，并将 items 分组
        const sellerGroupedItems = {};

        for (const item of items) {
            const product = await InternalProduct.findByPk(item.internalProductId);

            // 校验产品是否存在
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.internalProductId} not found` });
            }

            const { sellerId, price } = product;

            // 根据 sellerId 分组
            if (!sellerGroupedItems[sellerId]) {
                sellerGroupedItems[sellerId] = [];
            }

            // 将商品放入所在的 sellerId 分组中
            sellerGroupedItems[sellerId].push({
                internalProductId: item.internalProductId,
                quantity: item.quantity,
                unitPrice: price, // 从产品中获取价格
                subtotal: price * item.quantity, // 小计
            });
        }

        // 创建订单并返回所有成功创建的订单
        const createdOrders = [];
        for (const [sellerId, groupedItems] of Object.entries(sellerGroupedItems)) {
            // 计算总金额
            const totalAmount = groupedItems.reduce((sum, item) => sum + item.subtotal, 0);

            // 创建订单
            const order = await Order.create({
                buyerId,
                sellerId,
                totalAmount,
                paypalPayment: !!paypalTransactionId,
                paypalTransactionId,
            });

            // 创建订单项
            for (const groupedItem of groupedItems) {
                await OrderItem.create({
                    orderId: order.id,
                    internalProductId: groupedItem.internalProductId,
                    quantity: groupedItem.quantity,
                    unitPrice: groupedItem.unitPrice,
                    subtotal: groupedItem.subtotal,
                });
            }

            createdOrders.push(order); // 将创建的订单添加到结果中
        }

        // 返回创建成功的订单信息
        return res.status(201).json({ message: "Orders created successfully", orders: createdOrders });
    } catch (error) {
        console.error("Error creating orders:", error);
        return res.status(500).json({ message: "Error creating orders" });
    }
};

// 获取所有订单
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User,
                    as: 'buyer',
                    attributes: ['id', 'email', 'firstName', 'lastName'],
                },
                {
                    model: User,
                    as: 'seller',
                    attributes: ['id', 'email', 'firstName', 'lastName'],
                },
                {
                    model: OrderItem,
                    as: 'items',
                    include: {
                        model: InternalProduct,
                        as: 'internalProduct',
                    },
                },
            ],
        });
        return res.status(200).json(orders);
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        return res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
    }
};

// 获取单个订单
const getOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'buyer',
                    attributes: ['id', 'email', 'firstName', 'lastName'],
                },
                {
                    model: User,
                    as: 'seller',
                    attributes: ['id', 'email', 'firstName', 'lastName'],
                },
                {
                    model: OrderItem,
                    as: 'items',
                    include: {
                        model: InternalProduct,
                        as: 'internalProduct',
                    },
                },
            ],
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json(order);
    } catch (error) {
        console.error('Error retrieving order:', error);
        return res.status(500).json({ message: 'Error retrieving order' });
    }
};

// 更新订单状态
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error('Error updating order:', error);
        return res.status(500).json({ message: 'Error updating order' });
    }
};

// 删除订单
const deleteOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // 先删除订单项
        await OrderItem.destroy({
            where: { orderId: order.id },
        });

        // 删除订单
        await order.destroy();

        return res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        return res.status(500).json({ message: 'Error deleting order' });
    }
};

const getOrdersByBuyer = async (req, res) => {
    try {
        const buyerId = req.user.id; // 从 JWT 解码的用户对象中提取 buyerId

        const orders = await Order.findAll({
            where: { buyerId }, // 使用 buyerId 查询订单
            include: [
                {
                    model: User,
                    as: 'buyer',
                    attributes: ['id', 'email', 'firstName', 'lastName'],
                },
                {
                    model: User,
                    as: 'seller',
                    attributes: ['id', 'email', 'firstName', 'lastName'],
                },
                {
                    model: OrderItem,
                    as: 'items',
                    include: {
                        model: InternalProduct,
                        as: 'internalProduct',
                        include: {
                            model: Product, // 联合查询的 Product 模型
                            as: 'product', // 假设关联名称为 `product`
                            attributes: ['id', 'name'], // 返回的 Product 字段
                        },
                    },
                },
            ],
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this buyer' });
        }

        return res.status(200).json(orders);
    } catch (error) {
        console.error('Error retrieving orders for buyer:', error);
        return res.status(500).json({ message: 'Error retrieving buyer orders' });
    }
};

const getOrdersBySeller = async (req, res) => {
    try {
        const sellerId = req.user.id; // 从 JWT 解码的用户对象中提取 sellerId

        const orders = await Order.findAll({
            where: { sellerId }, // 使用 sellerId 查询订单
            include: [
                {
                    model: User,
                    as: 'buyer',
                    attributes: ['id', 'email', 'firstName', 'lastName'],
                },
                {
                    model: User,
                    as: 'seller',
                    attributes: ['id', 'email', 'firstName', 'lastName'],
                },
                {
                    model: OrderItem,
                    as: 'items',
                    include: {
                        model: InternalProduct,
                        as: 'internalProduct',
                    },
                },
            ],
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this seller' });
        }

        return res.status(200).json(orders);
    } catch (error) {
        console.error('Error retrieving orders for seller:', error);
        return res.status(500).json({ message: 'Error retrieving seller orders' });
    }
};


module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getOrdersByBuyer,
    getOrdersBySeller,
};