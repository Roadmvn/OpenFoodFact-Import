<template>
  <div class="container mx-auto p-6">
    <h1 class="text-xl font-bold text-center mb-6">Créer une Commande</h1>

    <!-- 表单 -->
    <el-form :model="orderForm" style="width: 100%; display: block;">
      <!-- 买家邮箱 -->
      <el-form-item label="Acheteur (Email)">
        <el-autocomplete
            v-model="searchEmail"
            :fetch-suggestions="fetchUsers"
            placeholder="Rechercher un acheteur"
            @select="onUserSelect"
            clearable
        ></el-autocomplete>
      </el-form-item>

      <!-- 商品添加 -->
      <el-form-item label="Produits" style="width: 100%; display: block;">
        <div
            v-for="(item, index) in orderForm.items"
            :key="index"
            class="mb-4 flex flex-col space-x-4 gap-2"
            style="width: 100%; display: block;"
        >
          <div class="flex flex-row justify-between items-start gap-2">
            <!-- 搜索商品 -->
            <el-autocomplete
                v-model="searchProductNames[index]"
                :fetch-suggestions="(queryString, cb) => fetchProducts(queryString, cb, index)"
                placeholder="Rechercher un produit"
                @select="(product) => onProductSelect(index, product)"
                clearable
            ></el-autocomplete>

            <!-- 商品数量 -->
            <el-input-number
                v-model="item.quantity"
                :min="1"
                placeholder="Quantité"
            />
            <el-button
                type="danger"
                size="small"
                @click="removeProduct(index)"
            >X</el-button>
            <el-button type="primary" size="small" @click="addProduct">
              Ajouter un Produit
            </el-button>

          </div>

          </div>

      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitOrderForm">
          Créer la Commande
        </el-button>
        <el-button @click="resetOrderForm" type="danger">Réinitialiser</el-button>
      </el-form-item>
    </el-form>

    <!-- 返回结果消息 -->
    <el-alert
        v-if="successMessage"
        :title="successMessage"
        type="success"
        show-icon
        class="mt-4"
        closable
    ></el-alert>

    <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        show-icon
        class="mt-4"
        closable
    ></el-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
const { $axios } = useNuxtApp(); // 使用 Nuxt 的 Axios 插件

// 表单数据模型
interface OrderForm {
  buyerId: number | null;
  items: {
    internalProductId: number | null;
    quantity: number;
  }[];
}

// 初始化表单数据
const orderForm = reactive<OrderForm>({
  buyerId: null,
  items: [{ internalProductId: null, quantity: 1 }]
});

// 邮箱搜索框绑定
const searchEmail = ref<string>("");

// 自动补全商品名称数组
const searchProductNames = ref<string[]>([""]);

// 成功和错误消息
const successMessage = ref<string>("");
const errorMessage = ref<string>("");

// 获取用户列表的接口实现
const fetchUsers = async (queryString: string, callback: (users: any[]) => void) => {
  try {
    const response = await $axios.get("/api/orders/seller/users");
    callback(
        response.data
            .filter((user: any) =>
                user.email.toLowerCase().includes(queryString.toLowerCase())
            )
            .map((user: any) => ({
              value: user.email, // 显示在自动补全中的值
              id: user.id // 实际的 buyerId
            }))
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    callback([]);
  }
};

// 选择买家后保存 buyerId
const onUserSelect = (user: { value: string; id: number }) => {
  orderForm.buyerId = user.id;
  searchEmail.value = user.value;
};

// 获取商品数据
const fetchProducts = async (
    queryString: string,
    callback: (products: any[]) => void,
    index: number
) => {
  try {
    const response = await $axios.get("/api/internal-products");
    callback(
        response.data.internalProducts
            .filter((product: any) =>
                product.product.name.toLowerCase().includes(queryString.toLowerCase())
            )
            .map((product: any) => ({
              value: product.product.name, // 商品名称
              id: product.id // 商品 ID
            }))
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    callback([]);
  }
};

// 选择商品后绑定 `internalProductId`
const onProductSelect = (index: number, product: { value: string; id: number }) => {
  console.log(`Selected product for row ${index}:`, product); // 调试日志
  orderForm.items[index].internalProductId = product.id;
  searchProductNames.value[index] = product.value || "";
};

// 提交订单
const submitOrderForm = async () => {
  console.log("Submitting order:", JSON.stringify(orderForm)); // 调试日志

  try {
    const response = await $axios.post("/api/orders/seller/create_order", orderForm);
    successMessage.value = "Commande créée avec succès !";
    resetOrderForm(); // 提交成功后重置表单
    window.location.href = "/seller/commandes";
  } catch (error) {
    console.error("Error creating order:", error);
    errorMessage.value = "Erreur lors de la création de la commande.";
  }
};

// 添加商品
const addProduct = () => {
  orderForm.items.push({ internalProductId: null, quantity: 1 });
  searchProductNames.value.push("");
};

// 删除商品
const removeProduct = (index: number) => {
  orderForm.items.splice(index, 1);
  searchProductNames.value.splice(index, 1);
};

// 重置表单
const resetOrderForm = () => {
  orderForm.buyerId = null;
  searchEmail.value = "";
  orderForm.items = [{ internalProductId: null, quantity: 1 }];
  searchProductNames.value = [""];
  successMessage.value = "";
  errorMessage.value = "";
};
</script>

<style scoped>
.container {
  max-width: 75%;
  margin: auto;
}

.el-form-item__content{
  width: 100%;
  align-items: baseline;
  display: block;
  flex: 1;
  line-height: 32px;
  min-width: 0;
  position: relative;
  flex-direction: row;
}

.el-form-item{
  display: block  ;
}

</style>