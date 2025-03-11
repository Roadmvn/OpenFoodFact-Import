const { Product } = require('../models'); // 引入 Sequelize Product 模型
const { Op, Sequelize} = require('sequelize');

class ProductController {

    /**
     * 通过 ID 查询单个产品
     * 公开接口，无需管理员权限
     */
    static async getProductById(req, res) {
        try {
            const { id } = req.params; // 从 URL 参数中获取产品 ID

            // 查找对应的产品
            const product = await Product.findByPk(id);

            // 如果未找到产品，返回 404 状态码
            if (!product) {
                return res.status(404).json({ message: 'Le produit spécifié n\'a pas été trouvé！' });
            }

            // 返回产品数据
            res.status(200).json(product);
        } catch (error) {
            console.error('Erreur lors de l\'obtention du produit par ID:', error);
            res.status(500).json({ message: 'Impossible de charger les informations sur le produit！' });
        }
    }


    /**
     * 分页和搜索获取产品，每页显示 20 个
     * 公开接口，无需管理员权限
     */
    static async getPaginatedProducts(req, res) {
        try {
            // 从请求参数中获取页码和搜索关键字
            const page = parseInt(req.query.page) || 1; // 页码，默认为第 1 页
            const query = req.query.query || '';       // 搜索关键字，默认为空字符串

            // 每页显示 20 个
            const limit = 20;
            const offset = (page - 1) * limit;

            // 构建搜索条件
            const searchCondition = query
                ? {
                    name: {
                        [Op.like]: `%${query}%`, // 模糊匹配名称中包含搜索关键字的产品
                    },
                }
                : {}; // 如果没有搜索关键字，则不使用条件

            // 获取分页产品列表
            const products = await Product.findAndCountAll({
                where: searchCondition, // 根据搜索条件过滤
                limit,                  // 页面限制
                offset,                 // 跳过的数量
                order: [['id', 'ASC']], // 根据 ID 升序排序
            });

            // 响应数据
            res.status(200).json({
                totalItems: products.count,        // 总产品数量
                totalPages: Math.ceil(products.count / limit), // 总页数
                currentPage: page,                // 当前页码
                products: products.rows,          // 当前页产品数据
            });
        } catch (error) {
            console.error('Erreur lors de l\'obtention de produits paginés:', error);
            res.status(500).json({ message: 'Impossible de charger la liste des produits！' });
        }
    }


    /**
     * 获取所有产品
     * 公开接口，无需管理员权限
     */
    static async getAllProducts(req, res) {
        try {
            const products = await Product.findAll();
            res.status(200).json(products);
        } catch (error) {
            console.error('Erreur "Obtenir tous les produits":', error);
            res.status(500).json({ message: 'Impossible de charger la liste des produits！' });
        }
    }

    /**
     * 创建新产品
     * 仅管理员可操作
     */
    static async createProduct(req, res) {
        try {
            const newProduct = await Product.create(req.body); // req.body 应包含产品信息
            res.status(201).json(newProduct);
        } catch (error) {
            console.error('Erreur de création de produit:', error);
            res.status(400).json({ message: 'Impossible de créer le produit, veuillez vérifier vos informations de saisie！' });
        }
    }

    /**
     * 更新产品
     * 仅管理员可操作
     */
    static async updateProduct(req, res) {
        try {
            const { id } = req.params; // 从 URL 参数获取产品 ID
            const updates = req.body; // 获取更新数据

            const product = await Product.findByPk(id); // 查找对应产品
            if (!product) {
                return res.status(404).json({ message: 'Le produit spécifié n\'a pas été trouvé！' });
            }

            const updatedProduct = await product.update(updates); // 更新产品字段
            res.status(200).json(updatedProduct);
        } catch (error) {
            console.error('Erreur de mise à jour du produit:', error);
            res.status(400).json({ message: 'Impossible de mettre à jour les informations sur le produit！' });
        }
    }

    /**
     * 删除产品
     * 仅管理员可操作
     */
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            const product = await Product.findByPk(id); // 查找要删除的产品
            if (!product) {
                return res.status(404).json({ message: 'Le produit spécifié n\'a pas été trouvé！' });
            }

            await product.destroy(); // 删除产品
            res.status(200).json({ message: 'Produit supprimé avec succès！' });
        } catch (error) {
            console.error('Erreur de suppression du produit:', error);
            res.status(500).json({ message: 'Impossible de supprimer le produit！' });
        }
    }

    /**
     * 按名字或代码进行模糊搜索，并支持品牌过滤
     */
    static async searchProducts(req, res) {
        try {
            const { q, brand, page = 1, limit = 20 } = req.query; // 获取查询参数（包括搜索关键字、品牌、分页参数）
            const offset = (page - 1) * limit; // 分页的偏移量

            // 构建搜索条件
            const searchCondition = {
                [Op.or]: [
                    { name: { [Op.like]: `%${q}%` } }, // 按名字模糊搜索
                    { code: { [Op.like]: `%${q}%` } }, // 或按代码模糊搜索
                    { barcode: { [Op.like]: `%${q}%` } }, // 或按条形码模糊搜索
                ],
            };

            // 如果传入了品牌参数，则追加品牌过滤
            if (brand) {
                searchCondition.brand = brand;
            }

            // 执行数据库查询
            const products = await Product.findAndCountAll({
                where: searchCondition, // 搜索条件
                limit: parseInt(limit), // 每页数量
                offset: parseInt(offset), // 偏移量
                order: [['name', 'ASC']], // 按名字升序排序
            });

            // 返回结果
            res.status(200).json({
                totalItems: products.count,         // 总匹配产品数
                totalPages: Math.ceil(products.count / limit), // 总页数
                currentPage: parseInt(page),        // 当前页
                products: products.rows,           // 当前页的产品列表
            });
        } catch (error) {
            console.error('Erreur de recherche de produits:', error);
            res.status(500).json({ message: 'Impossible d\'exécuter la recherche des produits！' });
        }
    }

    /**
     * 获取分页后的品牌列表，并去重
     */
    static async getPaginatedUniqueBrands(req, res) {
        try {
            // 获取请求参数
            const { page = 1, limit = 20, query } = req.query; // 默认第一页，每页显示 20 条
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let brands;

            if (query) {
                // 如果存在 query 参数，执行模糊搜索，忽略分页和偏移量
                brands = await Product.findAll({
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('brand')), 'brand']
                    ],
                    where: {
                        brand: {
                            [Sequelize.Op.like]: `%${query}%`, // 模糊匹配
                        },
                    },
                    order: [[Sequelize.col('brand'), 'ASC']],
                    raw: true, // 简化返回结果
                });
            } else {
                // 如果不存在 query 参数，则执行带分页的查询
                brands = await Product.findAll({
                    attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('brand')), 'brand']
                    ],
                    order: [[Sequelize.col('brand'), 'ASC']],
                    limit: parseInt(limit), // 每页的数量
                    offset: parseInt(offset), // 跳过的数量
                    raw: true, // 简化返回结果
                });
            }

            // 提取品牌名称数组
            const uniqueBrands = brands.map(item => item.brand);

            // 返回结果
            res.status(200).json({
                brands: uniqueBrands, // 当前品牌数据
                pagination: query
                    ? null // 如果是搜索，移除分页信息
                    : {
                        currentPage: parseInt(page),
                        perPage: parseInt(limit),
                    },
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des marques uniques paginées:', error);
            return res.status(500).json({ message: 'Impossible d\'obtenir la liste des marques！' });
        }
    }

    /**
     * Récupérer un produit par code-barres
     * Interface publique, pas besoin de droits d'administrateur
     */
    static async getProductByBarcode(req, res) {
        try {
            const { barcode } = req.params; // Récupérer le code-barres depuis les paramètres URL

            // Chercher le produit correspondant au code-barres
            const product = await Product.findOne({
                where: {
                    [Op.or]: [
                        { barcode: barcode },
                        { code: barcode } // Pour compatibilité avec ancien format
                    ]
                }
            });

            // Si aucun produit n'est trouvé, retourner un code d'état 404
            if (!product) {
                return res.status(404).json({ message: 'Aucun produit trouvé avec ce code-barres !' });
            }

            // Retourner les données du produit
            res.status(200).json(product);
        } catch (error) {
            console.error('Erreur lors de la récupération du produit par code-barres:', error);
            res.status(500).json({ message: 'Impossible de charger les informations du produit !' });
        }
    }
}

module.exports = ProductController;