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

// 卖家创建订单
const createOrderForBuyer = async (req, res) => {
    try {
        const { buyerId, items } = req.body; // 从请求体中解析 buyerId 和 items 数据
        const sellerId = req.user.id; // 从已验证的 JWT token 中获取卖家 ID

        // 校验 buyerId 和 items 是否存在
        if (!buyerId) {
            return res.status(400).json({ message: "Buyer ID is required." });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items are required and should be a non-empty array." });
        }

        // 校验所有产品是否存在以及是否属于当前卖家
        const processedItems = [];
        for (const item of items) {
            const internalProduct = await InternalProduct.findByPk(item.internalProductId);

            // 如果产品 ID 无效或者不属于当前卖家
            if (!internalProduct || internalProduct.sellerId !== sellerId) {
                return res.status(404).json({ message: `Product with ID ${item.internalProductId} not found or unauthorized.` });
            }

            // 校验库存是否充足
            if (internalProduct.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product with ID ${item.internalProductId}.` });
            }

            // 计算小计并添加到处理中商品列表
            processedItems.push({
                internalProductId: item.internalProductId,
                quantity: item.quantity,
                unitPrice: internalProduct.price, // 使用数据库中的单价
                subtotal: internalProduct.price * item.quantity, // 计算小计
            });

            // 更新产品库存
            internalProduct.quantity -= item.quantity;
            await internalProduct.save();
        }

        // 计算订单总金额
        const totalAmount = processedItems.reduce((sum, item) => sum + item.subtotal, 0);

        // 创建订单
        const order = await Order.create({
            buyerId,
            sellerId,
            totalAmount,
            paypalPayment: false, // PayPal 相关字段设置为 null/默认值
            paypalTransactionId: null,
        });

        // 为订单创建订单项
        for (const item of processedItems) {
            await OrderItem.create({
                orderId: order.id,
                internalProductId: item.internalProductId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
            });
        }

        // 返回成功的响应
        return res.status(201).json({
            message: "Order created successfully",
            order,
        });
    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ message: "An error occurred while creating the order." });
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
                            attributes: ['id', 'name', 'image_url'], // 返回的 Product 字段
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
                        include: {
                            model: Product, // 联合查询的 Product 模型
                            as: 'product', // 假设关联名称为 `product`
                            attributes: ['id', 'name', 'image_url'], // 返回的 Product 字段
                        },
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

/**
 * 获取与当前卖家(seller)关联的所有买家(users)
 * @param {Object} req - 请求对象，其中包含已验证的JWT token (req.user)
 * @param {Object} res - 响应对象，用于返回处理结果
 */
const getUsersBySeller = async (req, res) => {
    try {
        // 从JWT token中提取 sellerId
        const sellerId = req.user.id;

        if (!sellerId) {
            return res.status(401).json({ message: 'Seller token is invalid or missing.' });
        }

        // 使用 Order 模型查询所有和该 sellerId 关联的订单及买家
        const orders = await Order.findAll({
            where: { sellerId },
            include: {
                model: User,
                as: 'buyer', // 匹配 order.js 中定义的 'buyer' 别名
                attributes: ['id', 'email', 'firstName', 'lastName'], // 包括买家的有用字段
            },
        });

        // 整理出唯一的买家
        const buyers = [];
        const buyerIds = new Set();

        for (const order of orders) {
            if (!buyerIds.has(order.buyer.id)) {
                buyerIds.add(order.buyer.id);
                buyers.push(order.buyer);
            }
        }

        if (buyers.length === 0) {
            return res.status(404).json({ message: 'No users found for this seller.' });
        }

        // 返回买家信息
        return res.status(200).json(buyers);
    } catch (error) {
        console.error('Error retrieving users for seller:', error);
        return res.status(500).json({ message: 'An error occurred while retrieving users.' });
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
    getUsersBySeller,
    createOrderForBuyer
};