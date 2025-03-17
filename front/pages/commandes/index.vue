<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Commandes</h1>
    <div v-if="orders.length" class="space-y-6">
      <div
          v-for="order in orders"
          :key="order.id"
          class="p-4 bg-white shadow-lg rounded-lg border"
      >
        <div class="flex justify-between items-center">
          <div class="text-lg font-semibold">Numéro de commande : {{ order.id }}
            <el-tag v-if="order.status === 'pending'" type="danger">{{ order.status }}</el-tag>
            <el-tag v-else>{{ order.status }}</el-tag>
          </div>
          <div class="text-gray-500">Montant total : €{{ order.totalAmount }}</div>
        </div>
        <div v-for="item in order.items" :key="item.id" class="flex justify-between items-center mt-4">
          <div class="flex flex-row items-center gap-2">
            <el-image :src="item.internalProduct.product.image_url" style="max-width: 33px;border-radius: 5px;height: 55px;"></el-image>
            <el-text tag="b">{{ item.internalProduct.product.name + ' x ' + item.quantity }}</el-text>
          </div>
          <el-text>{{ item.internalProduct.price + ' x ' + item.quantity }} €</el-text>
        </div>
        <div class="mt-4 flex justify-end gap-3">
          <el-button
              size="small"
              type="primary"
              @click="payWithPayPal(order.id)"
              :disabled="order.paypalPayment || isLoading"
          >
            Payer avec PayPal
          </el-button>
          <el-button type="danger" size="small" @click="deleteOrder(order.id)" :disabled="order.paypalPayment || isLoading">
            Supprimer
          </el-button>
        </div>
        <!-- 动态创建 PayPal 按钮容器 -->
        <div
            v-if="selectedOrderId === order.id"
            id="paypal-button-container"
            class="mt-4"
        ></div>
      </div>
    </div>
    <div v-else class="text-center text-gray-500">
      Aucun ordre trouvé...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
const { $axios } = useNuxtApp() // 使用 Nuxt 的 Axios 插件

const orders = ref([]) // 存储订单
const isLoading = ref(false) // 加载状态
const selectedOrderId = ref(null) // 当前选中的订单 ID

// 获取用户订单
const fetchOrders = async () => {
  try {
    const response = await $axios.get('/api/orders/buyer/me')
    orders.value = response.data
  } catch (error) {
    console.error('Erreur lors de l\'obtention des commandes :', error)
    ElMessage.error('Impossible de charger les commandes pour le moment.')
  }
}

const deleteOrder = async (orderId) => {
  try {
    const response = await $axios.delete(`/api/orders/${orderId}`);
    window.location.href = '/commandes'
  }catch (error) {
    console.error('Erreur lors de la suppression de l\'ordre :', error)
    ElMessage.error('Impossible de supprimer l\'ordre.')
  }
}

const loadPayPalScript = async (clientId, currency = "EUR") => {
  if (typeof window.paypal !== "undefined") {
    // PayPal 已加载，无需重复加载
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    script.type = "text/javascript";
    script.async = true;
    script.onload = resolve; // PayPal SDK 加载完成
    script.onerror = reject; // 加载失败
    document.head.appendChild(script);
  });
};

// 启动 PayPal 支付
const payWithPayPal = async (localOrderId) => {
  try {
    isLoading.value = true;
    selectedOrderId.value = localOrderId; // 保存当前正在支付的订单 ID

    // 动态加载 PayPal SDK
    await loadPayPalScript("AX2YAQ3gXr-WidNvgMevZM5ysidZRocYDSF2sxkp5FXjhv8gcQtLpJ7A9YR7PG58N0NRJcEUXgVLrTSb", "EUR"); // 替换为你的 PayPal Client ID

    // **调用后端创建 PayPal 订单接口**
    const createOrderResponse = await $axios.post(`/api/paypal/create-order`, {
      localOrderId, // 向后端传递本地订单 ID
    });
    const { paypalTransactionId: paypalOrderId } = createOrderResponse.data; // 获取 PayPal 订单 ID
    if (!paypalOrderId) {
      throw new Error("Erreur : ID de commande PayPal invalide !");
    }

    // 启动 PayPal 按钮
    paypal
        .Buttons({
          // 将后端返回的 PayPal 订单 ID 传递到 PayPal 按钮
          createOrder: function () {
            return paypalOrderId;
          },
          // 捕获订单（支付成功时调用）
          onApprove: async function (data, actions) {
            try {
              // 捕获支付订单
              const captureResponse = await $axios.post(
                  `/api/paypal/capture-order/${data.orderID}` // `data.orderID` 来自 PayPal 的返回值
              );

              if (captureResponse.data.status === "success") {
                // 支付成功后的用户界面处理
                ElMessage.success("Paiement réussi !");
                fetchOrders(); // 刷新订单列表，查看最新支付状态
                window.location.reload(); // 可选：刷新页面以获取更新的订单视图
              } else {
                ElMessage.error("Erreur lors du paiement.");
              }
            } catch (err) {
              console.error("Erreur lors de la capture du paiement :", err);
              ElMessage.error("Impossible de capturer le paiement.");
            }
          },
          // 支付发生错误时调用
          onError: function (err) {
            console.error("PayPal SDK Error:", err);
            ElMessage.error("Impossible de lancer le paiement.");
          },
        })
        .render("#paypal-button-container"); // 渲染 PayPal 按钮到指定容器

  } catch (error) {
    console.error("Erreur lors de l'initiation du paiement avec PayPal :", error);
    ElMessage.error("Impossible de lancer le paiement.");
  } finally {
    isLoading.value = false; // 结束加载
  }
};

// 组件加载时获取订单
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>