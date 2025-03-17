const { User, Contact } = require('../models');

exports.createContact = async (req, res) => {
    let { message, buyerId, sellerId } = req.body;


    try {

        if (!buyerId && !sellerId) {
            buyerId = 1;
            sellerId = 1;
            const contact = await Contact.create({
                buyerId,
                sellerId,
                message,
            });

            return res.status(201).json(contact);
        }

        // 验证买家和卖家是否存在
        const buyer = await User.findByPk(buyerId);
        const seller = await User.findByPk(sellerId);

        if (!buyer || buyer.role !== 'buyer') {
            return res.status(400).json({ message: 'Invalid buyer ID or the user is not a buyer.' });
        }

        if (!seller || seller.role !== 'seller') {
            return res.status(400).json({ message: 'Invalid seller ID or the user is not a seller.' });
        }

        // 创建联系
        const contact = await Contact.create({
            buyerId,
            sellerId,
            message,
        });

        res.status(201).json(contact);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create contact.', error });
    }
};

exports.getBuyerContacts = async (req, res) => {
    const { id: buyerId } = req.user; // 从 `req.user` 获取当前用户 ID

    try {
        const contacts = await Contact.findAll({
            where: { buyerId },
            include: [
                { model: User, as: 'seller', attributes: ['id', 'email'] },
            ], // 可选：包含卖家的信息
        });

        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve contacts", error });
    }
};

exports.getSellerContacts = async (req, res) => {
    const { id: sellerId } = req.user;

    try {
        const contacts = await Contact.findAll({
            where: { sellerId },
            include: [
                { model: User, as: 'buyer', attributes: ['id', 'email'] },
            ], // 可选：包含买家的信息
        });

        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve contacts", error });
    }
};

exports.updateContactStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { id: userId, role } = req.user;

    try {
        const contact = await Contact.findByPk(id);

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        // 校验用户的权限
        if (role === 'buyer' && contact.buyerId !== userId) {
            return res.status(403).json({ message: "You are not allowed to update this contact" });
        }

        if (role === 'seller' && contact.sellerId !== userId) {
            return res.status(403).json({ message: "You are not allowed to update this contact" });
        }

        // 更新状态
        contact.status = status;
        await contact.save();

        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ message: "Failed to update contact status", error });
    }
};