export type Product = {
    id?: number; // 主键 ID，可能前端不需要
    code: string | null; // 条形码
    name: string; // 产品名称
    brand: string; // 品牌
    categories: string; // 分类
    labels: string; // 标签
    quantity: string | null; // 包装规格
    image_url: string | null; // 主图片 URL
    image_nutrition_url: string | null; // 营养图片 URL
    energy_kcal: number | null; // 每 100g 的热量
    fat: number | null; // 每 100g 脂肪
    saturated_fat: number | null; // 饱和脂肪
    sugars: number | null; // 糖分
    salt: number | null; // 盐分
    proteins: number | null; // 蛋白质
    created_at?: string; // 创建时间
    updated_at?: string; // 更新时间
}