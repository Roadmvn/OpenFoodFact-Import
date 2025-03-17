// controllers/paypalController.js
const { client } = require('../paypalClient');
const paypal = require('@paypal/checkout-server-sdk');
const { Order, Invoice } = require('../models');

const createOrder = async (req, res) => {
    const localOrderId = req.body.localOrderId; // 从前端传入的本地订单 ID

    // 检查 localOrderId 是否存在
    if (!localOrderId) {
        return res.status(400).json({ error: 'localOrderId est requis pour créer une commande avec PayPal' });
    }

    try {
        // 查询本地订单信息
        const order = await Order.findOne({ where: { id: localOrderId } });

        if (!order) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }

        const totalAmount = parseFloat(order.totalAmount); // 计算订单的总金额

        // 调用 PayPal API 创建支付订单
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'EUR',
                        value: totalAmount.toFixed(2), // 格式化金额为小数点后2位
                    },
                },
            ],
        });

        const response = await client().execute(request);

        // 将 PayPal 订单 ID 保存到数据库中
        order.paypalTransactionId = response.result.id; // 保存 PayPal 返回的订单 ID
        await order.save(); // 保存订单更新

        res.status(200).json({
            paypalTransactionId: response.result.id, // 返回给前端的 PayPal 订单 ID
            status: response.result.status, // 返回 PayPal 的订单状态
        });
    } catch (err) {
        console.error('Impossible de créer la commande:', err);
        res.status(500).json({ error: 'Impossible de créer la commande' });
    }
};

const captureOrder = async (req, res) => {
    const paypalOrderId = req.params.paypalOrderId; // 从请求 URL 中获取 PayPal 的订单 ID

    console.log('PayPal Order ID:', req.params.paypalOrderId);

    // 检查 PayPal Order ID 是否存在
    if (!paypalOrderId) {
        return res.status(400).json({ error: 'paypalOrderId 是捕获订单所必需的' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    try {
        // 调用 PayPal 客户端捕获订单支付
        const response = await client().execute(request);

        // 确保支付捕获成功
        if (response.result && response.result.status === 'COMPLETED') {
            // 查询数据库中关联的订单
            const order = await Order.findOne({ where: { paypalTransactionId: paypalOrderId } });

            if (!order) {
                return res.status(404).json({
                    error: '与此 PayPal ID 关联的订单不存在',
                });
            }

            // 更新订单支付状态
            order.status = 'completed';
            order.paypalPayment = true; // 标记为 PayPal 支付
            await order.save(); // 保存更新

            // 在这里添加生成发票逻辑
            try {
                // 生成唯一发票编号
                const invoiceNumber = `INV-${Date.now()}`;

                // 在数据库中创建发票
                const newInvoice = await Invoice.create({
                    orderId: order.id, // 关联到订单
                    invoiceNumber,
                    totalAmount: order.totalAmount, // 使用订单金额
                    status: 'paid', // 已支付状态
                });

                console.log('发票已成功创建:', newInvoice);

                res.status(200).json({
                    status: 'success',
                    message: '订单支付已成功捕获并生成了发票',
                    captureId: response.result.id, // 返回 PayPal 捕获 ID
                    invoice: newInvoice, // 返回生成的发票
                });
            } catch (invoiceError) {
                console.error('创建发票时发生错误:', invoiceError);
                res.status(500).json({ error: '订单支付已成功捕获，但生成发票失败' });
            }
        } else {
            return res.status(400).json({
                error: '订单支付未能成功捕获',
            });
        }
    } catch (err) {
        console.error('捕获订单时发生错误:', err);
        res.status(500).json({
            error: '订单支付捕获失败',
        });
    }
};

module.exports = { createOrder, captureOrder };