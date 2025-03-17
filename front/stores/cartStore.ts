import { defineStore } from "pinia";

interface CartItem {
    id: number; // 购物车项ID（从后端返回的ID）
    productId: number; // 产品ID
    name: string; // 产品名称
    price: number; // 单价
    quantity: number; // 数量
    total: number; // 单项总价（price * quantity）
    image: string; // 产品图片（可选）
}

interface CartState {
    items: CartItem[]; // 当前购物车项
    totalQuantity: number; // 总商品数量
    totalPrice: number; // 总价
}

export const useCartStore = defineStore("cartStore", {
    state: (): CartState => ({
        items: [], // 初始化购物车为空
        totalQuantity: 0,
        totalPrice: 0,
    }),

    getters: {
        // 计算总商品数量
        cartTotalQuantity(state): number {
            return state.items.reduce((total, item) => total + item.quantity, 0);
        },
        // 计算购物车总价
        cartTotalPrice(state): number {
            return state.items.reduce((total, item) => total + item.total, 0);
        },
    },

    actions: {
        // 获取购物车数据（从后端加载）
        async fetchCart() {
            try {
                const { $axios } = useNuxtApp() // 使用 Axios 实例
                const response = await $axios.get("/api/cart"); // 调用你的后端API
                this.items = response.data.cartItems.map((item: any) => ({
                    id: item.id,
                    productId: item.internalProductId,
                    name: item.internalProduct.product.name,
                    price: item.internalProduct.price, // 请确保后端返回了价格字段
                    quantity: item.quantity,
                    total: item.internalProduct.price * item.quantity,
                    image: item.internalProduct.product.image_url,
                }));
                this.calculateCart(); // 重新计算总价
            } catch (error) {
                console.error("Impossible de récupérer le panier d'achat:", error);
            }
        },

        // 添加商品到购物车
        // 添加商品到购物车
        async addToCart(productId: number, quantity: number = 1, product: any) {
            try {
                const { $axios } = useNuxtApp(); // 使用 Axios 实例
                const response = await $axios.post("/api/cart", { internalProductId: productId, quantity });
                const newItem = response.data.cartItem; // 获取后端返回的购物车项目

                // 检查购物车中是否已经存在该商品
                const existingItem = this.items.find(
                    (item) => item.productId === newItem.internalProductId
                );

                if (existingItem) {
                    // 如果购物车中已存在该商品，更新数量和总价
                    existingItem.quantity += quantity;
                    existingItem.total = existingItem.price * existingItem.quantity;
                } else {
                    // 如果购物车中不存在该商品，添加新商品
                    this.items.push({
                        id: newItem.id,
                        productId: newItem.internalProductId, // 后端返回的产品 ID
                        name: product.name, // 从前端传递的产品名称
                        price: newItem.internalProduct.price, // 从后端返回价格
                        quantity: newItem.quantity, // 设置商品数量
                        total: newItem.internalProduct.price * newItem.quantity, // 计算总价
                        image: product.image_url || newItem.internalProduct.product.image_url, // 产品图片
                    });

                    window.location.reload();
                }

                // 更新购物车总计
                this.calculateCart();
            } catch (error) {
                console.error("Ajout au panier échoué:", error);
                window.location.reload();
            }
        },

        // 更新购物车项数量
        async updateCartItem(cartItemId: number, quantity: number) {
            try {
                const { $axios } = useNuxtApp() // 使用 Axios 实例
                await $axios.put(`/api/cart/${cartItemId}`, { quantity });

                const item = this.items.find((item) => item.id === cartItemId);
                if (item) {
                    item.quantity = quantity;
                    item.total = item.price * quantity;
                }
                this.calculateCart();
            } catch (error) {
                console.error("Impossible de mettre à jour le panier d'achat:", error);
            }
        },

        // 删除购物车中的某一项
        async removeCartItem(cartItemId: number) {
            try {
                const { $axios } = useNuxtApp() // 使用 Axios 实例
                await $axios.delete(`/api/cart/${cartItemId}`);
                this.items = this.items.filter((item) => item.id !== cartItemId);
                this.calculateCart();
            } catch (error) {
                console.error("Impossible de supprimer l'élément du panier:", error);
            }
        },

        // 清空购物车
        async clearCart() {
            try {
                const { $axios } = useNuxtApp() // 使用 Axios 实例
                await $axios.delete("/api/cart");
                this.items = [];
                this.calculateCart();
            } catch (error) {
                console.error("Impossible de vider le panier:", error);
            }
        },

        // 新增支付并提交订单函数
        async payer(paypalTransactionId: string | null = null) {
            try {
                const { $axios } = useNuxtApp(); // 使用 Axios 实例

                // 构造订单请求数据
                const orderItems = this.items.map((item) => ({
                    internalProductId: item.productId, // 产品 ID
                    quantity: item.quantity, // 商品数量
                }));

                // 检查购物车中是否有商品
                if (orderItems.length === 0) {
                    throw new Error("Le panier est vide et la commande ne peut pas être soumise.");
                }

                // 调用 API 提交订单
                const response = await $axios.post("/api/orders", {
                    items: orderItems,
                    paypalTransactionId, // 可选的 PayPal 交易 ID（若传入，则接入在线支付）
                });

                // 返回的订单信息
                const { orders } = response.data;

                // 清空购物车并重新计算总价
                this.items = [];
                this.totalQuantity = 0;
                this.totalPrice = 0;
                this.clearCart();

                // 显示订单创建成功的信息
                console.log("Commande créée avec succès:", orders);
                return orders; // 可返回订单信息以便后续前端使用
            } catch (error) {
                throw error; // 将错误抛出以便前端进行处理（如显示错误提示）
            }
        },


    // 手动计算总价和总数量
        calculateCart() {
            this.totalQuantity = this.items.reduce((total, item) => total + item.quantity, 0);
            this.totalPrice = this.items.reduce((total, item) => total + item.total, 0);
        },
    },
});