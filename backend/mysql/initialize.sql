CREATE TABLE IF NOT EXISTS Products (
    id INT AUTO_INCREMENT PRIMARY KEY,          -- 产品 ID
    code VARCHAR(255) UNIQUE,                  -- 条形码（唯一值）
    name TEXT,                                 -- 产品名称
    brand TEXT,                                -- 品牌
    categories TEXT,                           -- 分类
    labels TEXT,                               -- 标签
    quantity TEXT,                             -- 包装规格
    image_url TEXT,                            -- 产品主图片
    image_nutrition_url TEXT,                  -- 营养图片
    energy_kcal DECIMAL(10, 2),                -- 热量
    fat DECIMAL(10, 2),                        -- 总脂肪
    saturated_fat DECIMAL(10, 2),              -- 饱和脂肪
    sugars DECIMAL(10, 2),                     -- 糖分
    salt DECIMAL(10, 2),                       -- 盐分
    proteins DECIMAL(10, 2),                   -- 蛋白质
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );