const { Invoice, Order, User, OrderItem, InternalProduct, Product} = require('../models'); // 引入模型

/**
 * 创建发票
 */
const createInvoice = async (req, res) => {
    try {
        const { orderId, totalAmount } = req.body;

        if (!orderId || !totalAmount) {
            return res.status(400).json({ error: 'orderId 和 totalAmount 是必填项' });
        }

        // 确保订单存在
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ error: `订单 ID ${orderId} 不存在` });
        }

        // 生成唯一发票编号
        const invoiceNumber = `INV-${Date.now()}`;

        // 创建发票
        const newInvoice = await Invoice.create({
            orderId,
            invoiceNumber,
            totalAmount,
            status: 'unpaid', // 默认状态
        });

        res.status(201).json(newInvoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '创建发票失败' });
    }
};

/**
 * 获取单个发票详情
 */
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await Invoice.findByPk(id, {
            include: [
                {
                    model: Order,
                    as: 'order',
                    attributes: ['userId', 'sellerId', 'totalAmount'], // 包含订单相关信息
                },
            ],
        });

        if (!invoice) {
            return res.status(404).json({ error: `发票 ID ${id} 不存在` });
        }

        res.status(200).json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '获取发票失败' });
    }
};

/**
 * 获取所有发票 (管理员)
 */
const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            include: [
                {
                    model: Order,
                    as: 'order',
                    attributes: ['buyerId', 'sellerId', 'totalAmount', 'status'], // 包含订单相关信息
                    include: [
                        {
                            model: User,
                            as: 'buyer', // 买家信息
                            attributes: ['id', 'email', 'firstName', 'lastName'],
                        },
                        {
                            model: User,
                            as: 'seller', // 卖家信息
                            attributes: ['id', 'email', 'firstName', 'lastName'],
                        },
                        {
                            model: OrderItem,
                            as: 'items',
                            include: {
                                model: InternalProduct,
                                as: 'internalProduct',
                                attributes: ['sellerId'],
                                include: [{
                                    model: Product, // 联合查询的 Product 模型
                                    as: 'product', // 假设关联名称为 `product`
                                    attributes: ['id', 'name', 'image_url'], // 返回的 Product 字段
                                },{
                                    model: User,
                                    as: 'seller',
                                    attributes: ['id', 'email', 'firstName', 'lastName'],
                                }]
                            },
                        },
                    ],
                },
            ],
        });
        res.status(200).json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Impossible d\'obtenir toutes les factures' });
    }
};

/**
 * 更新发票
 */
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, totalAmount } = req.body;

        const invoice = await Invoice.findByPk(id);
        if (!invoice) {
            return res.status(404).json({ error: `发票 ID ${id} 不存在` });
        }

        // 更新字段
        invoice.status = status || invoice.status;
        invoice.totalAmount = totalAmount || invoice.totalAmount;

        await invoice.save();

        res.status(200).json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '更新发票失败' });
    }
};

/**
 * 删除发票
 */
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await Invoice.findByPk(id);
        if (!invoice) {
            return res.status(404).json({ error: `发票 ID ${id} 不存在` });
        }

        await invoice.destroy();

        res.status(200).json({ message: `发票 ID ${id} 已删除` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '删除发票失败' });
    }
};

/**
 * 用户获取自己的发票
 */
/**
 * 获取用户的发票，包括详情信息（如卖家、产品）
 */
const getUserInvoicesWithDetails = async (req, res) => {
    try {
        const userId = req.user.id; // 从 JWT 中提取用户 ID

        if (!userId) {
            return res.status(400).json({ error: '用户 ID 无法通过身份验证获取' });
        }

        // 查询用户的发票及详细信息
        const invoices = await Invoice.findAll({
            include: [
                {
                    model: Order,
                    as: 'order', // 关联订单信息
                    where: { buyerId: userId }, // 限定为当前用户的订单
                    attributes: ['id', 'sellerId', 'status', 'totalAmount'],
                    include: [
                        {
                            model: User,
                            as: 'buyer', // 买家信息
                            attributes: ['id', 'email', 'firstName', 'lastName'],
                        },
                        {
                            model: User,
                            as: 'seller', // 卖家信息
                            attributes: ['id', 'email', 'firstName', 'lastName'],
                        },
                        {
                            model: OrderItem,
                            as: 'items',
                            include: {
                                model: InternalProduct,
                                as: 'internalProduct',
                                attributes: ['sellerId'],
                                include: [{
                                    model: Product, // 联合查询的 Product 模型
                                    as: 'product', // 假设关联名称为 `product`
                                    attributes: ['id', 'name', 'image_url'], // 返回的 Product 字段
                                },{
                                    model: User,
                                    as: 'seller',
                                    attributes: ['id', 'email', 'firstName', 'lastName'],
                                }]
                            },
                        },
                    ],
                },
            ],
        });

        if (!invoices || invoices.length === 0) {
            return res.status(404).json({ message: '未找到任何发票' });
        }

        return res.status(200).json(invoices);
    } catch (error) {
        console.error('获取用户发票（包括详细信息）时发生错误:', error);
        return res.status(500).json({ error: '获取用户发票（包含详细信息）失败' });
    }
};

/**
 * 卖家获取自己的发票
 */
const getSellerInvoices = async (req, res) => {
    try {
        const sellerId = req.user.id; // 从身份认证中获取卖家 ID

        const invoices = await Invoice.findAll({
            include: [
                {
                    model: Order,
                    as: 'order', // 关联订单信息
                    where: { sellerId: sellerId }, // 限定为当前用户的订单
                    attributes: ['id', 'sellerId', 'status', 'totalAmount'],
                    include: [
                        {
                            model: User,
                            as: 'buyer', // 买家信息
                            attributes: ['id', 'email', 'firstName', 'lastName'],
                        },
                        {
                            model: User,
                            as: 'seller', // 卖家信息
                            attributes: ['id', 'email', 'firstName', 'lastName'],
                        },
                        {
                            model: OrderItem,
                            as: 'items',
                            include: {
                                model: InternalProduct,
                                as: 'internalProduct',
                                attributes: ['sellerId'],
                                include: [{
                                    model: Product, // 联合查询的 Product 模型
                                    as: 'product', // 假设关联名称为 `product`
                                    attributes: ['id', 'name', 'image_url'], // 返回的 Product 字段
                                },{
                                    model: User,
                                    as: 'seller',
                                    attributes: ['id', 'email', 'firstName', 'lastName'],
                                }]
                            },
                        },
                    ],
                },
            ],
        });

        res.status(200).json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '获取卖家发票失败' });
    }
};

module.exports = {
    createInvoice,
    getInvoiceById,
    getAllInvoices,
    updateInvoice,
    deleteInvoice,
    getUserInvoicesWithDetails,
    getSellerInvoices,
};