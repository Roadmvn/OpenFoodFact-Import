const { InternalProduct, Product, User} = require('../models');
const { Op } = require('sequelize');

// 创建内部产品
exports.createInternalProduct = async (req, res) => {
    try {
        const { productId, price, quantity } = req.body;

        // 检查产品是否存在
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Produit non trouvé." });
        }

        // 创建新内部产品
        const internalProduct = await InternalProduct.create({
            sellerId: req.user.id,
            productId,
            price,
            quantity,
        });

        res.status(201).json({
            message: "Produit interne crée avec succès.",
            internalProduct,
        });
    } catch (error) {
        console.error('Erreur lors de la création du produit interne:', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 获取当前 seller 的内部产品列表
exports.getInternalProducts = async (req, res) => {
    try {
        const internalProducts = await InternalProduct.findAll({
            where: { sellerId: req.user.id },
            include: [{ model: Product, as: 'product' }],
        });

        res.status(200).json({
            message: "Liste des produits internes récupérée avec succès.",
            internalProducts,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des produits internes:', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 通过 ID 获取产品信息
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params; // 获取请求参数中的 internal product ID

        // 查询指定 ID 的 internal product，联合查询关联表信息
        const product = await InternalProduct.findOne({
            where: { id }, // 根据 ID 查询
            include: [
                {
                    model: Product, // 关联的 Product 表
                    as: 'product', // 使用定义关联时的 alias
                    attributes: ['id', 'name', 'image_url', 'brand', 'categories'], // 限定字段
                },
                {
                    model: User, // 关联的 Seller 用户表
                    as: 'seller', // 使用定义关联时的 alias
                    attributes: ['id', 'email'], // 限定字段
                },
            ],
            attributes: ['id', 'price', 'quantity'], // 限定 InternalProduct 自己的字段
        });

        // 如果未找到对应的记录
        if (!product) {
            return res.status(404).json({ message: "Produit non trouvé." });
        }

        // 返回查询结果
        res.status(200).json({
            message: "Produit récupéré avec succès.",
            product,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du produit:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};


// 更新内部产品
exports.updateInternalProduct = async (req, res) => {
    try {
        const { id } = req.params; // 内部产品 ID
        const { price, quantity } = req.body;

        const internalProduct = await InternalProduct.findOne({
            where: { id, sellerId: req.user.id },
        });

        if (!internalProduct) {
            return res.status(404).json({ message: "Produit interne non trouvé ou non autorisé." });
        }

        // 更新价格和数量
        internalProduct.price = price || internalProduct.price;
        internalProduct.quantity = quantity || internalProduct.quantity;
        await internalProduct.save();

        res.status(200).json({
            message: "Produit interne mis à jour avec succès.",
            internalProduct,
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du produit interne:', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 删除内部产品
exports.deleteInternalProduct = async (req, res) => {
    try {
        const { id } = req.params; // 内部产品 ID

        const internalProduct = await InternalProduct.findOne({
            where: { id, sellerId: req.user.id },
        });

        if (!internalProduct) {
            return res.status(404).json({ message: "Produit interne non trouvé ou non autorisé." });
        }

        await internalProduct.destroy();

        res.status(200).json({ message: "Produit interne supprimé avec succès." });
    } catch (error) {
        console.error('Erreur lors de la suppression du produit interne:', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 获取所有 Internal Products 并返回产品信息、卖家邮箱、价格、数量
exports.getAllInternalProducts = async (req, res) => {
    try {
        // 使用 Sequelize 的联合查询
        const internalProducts = await InternalProduct.findAll({
            include: [
                {
                    model: Product, // 关联 Product 模型
                    as: 'product',  // 别名，与 `InternalProduct` 的关联关系
                    attributes: ['id', 'name', 'brand', 'categories', 'labels', 'image_url'], // 只筛选必要的字段
                },
                {
                    model: User, // 关联 User 模型
                    as: 'seller', // 别名，假设 `InternalProduct` 中的 `sellerId` 对应 'User'
                    attributes: ['email'], // 获取卖家的邮箱
                },
            ],
        });

        // 返回查询结果
        res.status(200).json({
            message: "Liste complète des produits internes récupérée avec succès.",
            internalProducts,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des produits internes:', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 动态搜索函数
exports.dynamicSearch = async (req, res) => {
    try {
        // 从请求中获取查询参数
        const {
            sellerId,
            price,
            quantity,
            name,
            brand,
            categories,
            labels,
            code,
            energy_kcal,
            fat,
            saturated_fat,
            sugars,
            salt,
            proteins,
        } = req.query;

        // 动态生成查询条件
        const internalProductConditions = {};
        const productConditions = {};

        // InternalProduct 字段条件
        if (sellerId) {
            internalProductConditions.sellerId = { [Op.like]: `%${sellerId}%` };
        }
        if (price) {
            internalProductConditions.price = { [Op.like]: `%${price}%` };
        }
        if (quantity) {
            internalProductConditions.quantity = { [Op.like]: `%${quantity}%` };
        }

        // Product 字段条件
        if (name) {
            productConditions.name = { [Op.like]: `%${name}%` };
        }
        if (brand) {
            productConditions.brand = { [Op.like]: `%${brand}%` };
        }
        if (categories) {
            productConditions.categories = { [Op.like]: `%${categories}%` };
        }
        if (labels) {
            productConditions.labels = { [Op.like]: `%${labels}%` };
        }
        if (code) {
            productConditions.code = { [Op.like]: `%${code}%` };
        }
        if (energy_kcal) {
            productConditions.energy_kcal = { [Op.like]: `%${energy_kcal}%` };
        }
        if (fat) {
            productConditions.fat = { [Op.like]: `%${fat}%` };
        }
        if (saturated_fat) {
            productConditions.saturated_fat = { [Op.like]: `%${saturated_fat}%` };
        }
        if (sugars) {
            productConditions.sugars = { [Op.like]: `%${sugars}%` };
        }
        if (salt) {
            productConditions.salt = { [Op.like]: `%${salt}%` };
        }
        if (proteins) {
            productConditions.proteins = { [Op.like]: `%${proteins}%` };
        }

        // 执行查询
        const results = await InternalProduct.findAll({
            where: internalProductConditions, // InternalProduct 条件
            include: [
                {
                    model: Product,
                    as: 'product',
                    where: productConditions, // Product 条件
                },
            ],
        });

        // 返回结果
        res.status(200).json({
            message: '搜索成功',
            results,
        });
    } catch (error) {
        console.error('搜索时发生错误:', error);
        res.status(500).json({ message: '服务器错误，请稍后重试。' });
    }
};

