const { User } = require('../models'); // 正确解构导入 User 模型

// 获取全部用户信息
exports.getAllUsers = async (req, res) => {
    try {
        // 获取用户数据（默认 Scope 应排除密码，确保安全）
        const users = await User.findAll({
            attributes: { exclude: ['password'] }, // 排除密码字段
        });

        // 如果用户列表为空
        if (users.length === 0) {
            return res.status(404).json({ message: 'Aucun utilisateur trouvé.' });
        }

        // 返回用户列表
        res.status(200).json({
            message: 'Liste des utilisateurs récupérée avec succès.',
            users,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la liste des utilisateurs :', error);
        res.status(500).json({ message: 'Impossible de récupérer la liste des utilisateurs.' });
    }
};


// 获取当前用户的信息
exports.getCurrentUser = async (req, res) => {
    try {
        // 从 Auth 中间件附加的用户对象中获取当前登录用户
        const user = req.user;

        // 默认 Scope 会排除密码字段，如果未设定请再手动 exclude
        const userWithoutPassword = await User.findOne({
            where: { id: user.id },
            attributes: { exclude: ['password'] },
        });

        // 如果用户信息不存在（理论上不会走到这一步）
        if (!userWithoutPassword) {
            return res.status(404).json({ message: 'L\'utilisateur n\'existe pas' });
        }

        // 返回用户信息
        res.status(200).json({
            message: 'Informations utilisateur obtenues avec succès',
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error('Erreur lors de l\'obtention des informations utilisateur:', error);
        res.status(500).json({ message: 'Impossible d\'obtenir les informations de l\'utilisateur' });
    }
};

// update user info
exports.updateUser = async (req, res) => {
    try {
        const userId = req.user.id; // 从请求中获取当前用户 ID（从认证中间件提供）

        // 解构可能的更新字段，只有存在的字段才会更新
        const {
            firstName,
            lastName,
            phone,
            address,
            zipCode,
            city,
            country,
        } = req.body;

        // 查找用户
        const user = await User.findByPk(userId);

        // 如果用户不存在
        if (!user) {
            return res.status(404).json({ message: "L'utilisateur n'existe pas" });
        }

        // 更新用户信息，仅更新在请求中提供的字段
        const updatedUser = await user.update({
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone && { phone }),
            ...(address && { address }),
            ...(zipCode && { zipCode }),
            ...(city && { city }),
            ...(country && { country }),
        });

        // 返回更新后的用户信息
        res.status(200).json({
            message: "Informations utilisateur mises à jour avec succès",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour des informations utilisateur:", error);
        res.status(500).json({ message: "Impossible de mettre à jour les informations de l'utilisateur" });
    }

};

// 通过用户 ID 获取用户信息（仅限管理员权限）
exports.getUserById = async (req, res) => {
    try {
        // 从请求中获取用户 ID
        const { id } = req.params;

        // 获取当前登录用户的信息
        const currentUser = req.user;

        // 检查当前用户是否是管理员
        if (currentUser.role !== 'admin') {
            return res.status(403).json({ message: "Vous n'avez pas l'autorisation pour cette opération." });
        }

        // 查找指定 ID 的用户
        const user = await User.findOne({
            where: { id },
            attributes: { exclude: ['password'] }, // 排除密码字段，确保安全
        });

        // 如果用户不存在
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // 返回用户信息
        res.status(200).json({
            message: "Informations utilisateur récupérées avec succès.",
            user,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur :', error);
        res.status(500).json({ message: "Impossible de récupérer les informations de l'utilisateur." });
    }
};

// 通过用户 ID 更新用户信息（仅限管理员权限）
exports.updateUserByAdmin = async (req, res) => {
    try {
        // 从请求参数中获取用户 ID
        const { id } = req.params;

        // 获取当前登录用户信息
        const currentUser = req.user;

        // 检查当前登录用户是否是管理员
        if (currentUser.role !== 'admin') {
            return res.status(403).json({ message: "Vous n'avez pas l'autorisation pour cette opération." });
        }

        // 待更新的字段
        const {
            firstName,
            lastName,
            phone,
            address,
            zipCode,
            city,
            country,
            email,
            role
        } = req.body;

        // 查找目标用户
        const user = await User.findOne({
            where: { id },
        });

        // 如果目标用户不存在
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // 更新用户信息，仅更新请求中存在的字段
        const updatedUser = await user.update({
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone && { phone }),
            ...(address && { address }),
            ...(zipCode && { zipCode }),
            ...(city && { city }),
            ...(country && { country }),
            ...(email && { email }),
            ...(role && { role }), // 注意：仅管理员可以更改用户角色
        });

        // 返回成功响应
        res.status(200).json({
            message: "Informations de l'utilisateur mises à jour avec succès.",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur par l'administrateur :", error);
        res.status(500).json({
            message: "Impossible de mettre à jour les informations de l'utilisateur.",
        });
    }
};
