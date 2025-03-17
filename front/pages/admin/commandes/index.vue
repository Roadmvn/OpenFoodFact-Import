<template>
  <div class="flex h-screen">
    <!-- Menu部分，占比3 -->
    <div class="basis-3/12 bg-gray-200 p-4">
      <MenuComponent />
    </div>

    <!-- Contenu部分，占比7 -->
    <div class="basis-9/12 p-4 grid gap-4" style="max-height: 95vh; overflow-y: scroll;">
      <!-- ChartComponents 等分，2列 -->
      <div class="container mx-auto p-6">
        <!-- 页面标题 -->
        <h1 class="text-xl font-bold text-center mb-6">Liste des Commandes</h1>
        <div class="flex justify-end mb-6">
          <el-button size="large" type="primary" @click="to_route('/seller/commandes/create')">Create</el-button>
        </div>

        <!-- 表格展示 -->
        <el-table
            v-if="orders.length > 0"
            :data="orders"
            style="width: 100%;"
            border
            stripe
        >
          <!-- Commande ID -->
          <el-table-column prop="id" label="ID Commande" align="center" width="120" />

          <!-- 买家信息 -->
          <el-table-column label="Acheteur" align="center">
            <template #default="scope">
              <div>
                <p><strong>Nom :</strong> {{ scope.row.buyer.firstName }} {{ scope.row.buyer.lastName }}</p>
                <p><strong>Email :</strong> {{ scope.row.buyer.email }}</p>
              </div>
            </template>
          </el-table-column>

          <!-- 卖家信息 -->
          <el-table-column label="Vendeur" align="center">
            <template #default="scope">
              <div>
                <p><strong>Nom :</strong> {{ scope.row.seller.firstName }} {{ scope.row.seller.lastName }}</p>
                <p><strong>Email :</strong> {{ scope.row.seller.email }}</p>
              </div>
            </template>
          </el-table-column>

          <!-- 总金额 -->
          <el-table-column prop="totalAmount" label="Montant Total (€)" align="center" />

          <!-- 订单状态 -->
          <el-table-column label="Statut" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'completed' ? 'success' : 'warning'">
                {{ formatStatus(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 支付方式 -->
          <el-table-column label="Paiement via PayPal" align="center" width="150">
            <template #default="scope">
              <el-tag :type="scope.row.paypalPayment ? 'success' : 'danger'">
                {{ scope.row.paypalPayment ? 'Oui' : 'Non' }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column label="Produits" align="center" width="150">
            <template #default="scope">
              <el-button type="primary" @click="showProducts(scope.row)">Voir Produits</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 如果没有 commande -->
        <div v-else class="text-center text-gray-500 mt-6">
          Aucune commande disponible.
        </div>

        <!-- 弹窗查看产品 -->
        <el-dialog v-model="isDialogVisible" title="Liste des Produits" width="50%">
          <el-table :data="selectedProducts" style="width: 100%;" border>
            <el-table-column prop="internalProduct.product.name" label="Nom du Produit" align="center" />
            <el-table-column prop="quantity" label="Quantité" align="center" />
            <el-table-column prop="unitPrice" label="Prix Unitaire (€)" align="center" />
            <el-table-column prop="subtotal" label="Sous-total (€)" align="center" />
          </el-table>
          <span slot="footer" class="dialog-footer">
        <el-button @click="isDialogVisible = false">Fermer</el-button>
      </span>
        </el-dialog>
      </div>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import MenuComponent from "~/components/AdminPage/MenuComponent.vue";
const { $axios } = useNuxtApp();

// 类型定义：产品、买家、卖家和订单（Commandes）
interface Product {
  id: number;
  name: string;
  image_url: string;
}

interface InternalProduct {
  id: number;
  sellerId: number;
  productId: number;
  price: string;
  quantity: number;
  product: Product;
}

interface Item {
  id: number;
  orderId: number;
  internalProductId: number;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  internalProduct: InternalProduct;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface Order {
  id: number;
  buyerId: number;
  sellerId: number;
  totalAmount: string;
  status: string;
  paypalPayment: boolean;
  paypalTransactionId: string;
  createdAt: string;
  updatedAt: string;
  buyer: User;
  seller: User;
  items: Item[];
}

// 存储订单数据
const orders = ref<Order[]>([]);

// 弹窗状态和产品选项
const isDialogVisible = ref(false);
const selectedProducts = ref<Item[]>([]);

const to_route = (path: string) => {
  window.location.href = path;
}

// 请求订单数据
const fetchOrders = async () => {
  try {
    const response = await $axios.get('/api/orders');
    orders.value = response.data; // 将 API 返回值赋值给订单数据
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes :', error);
    ElMessage.error('Impossible de charger les commandes.');
  }
};

// 显示订单详情中的产品
const showProducts = (order: Order) => {
  selectedProducts.value = order.items; // 设置选中的订单产品
  isDialogVisible.value = true; // 打开产品弹窗
};

// 格式化状态
const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    completed: 'Terminé',
    pending: 'En cours',
    cancelled: 'Annulé',
  };
  return statuses[status] || status;
};

// 页面挂载时调用
onMounted(fetchOrders);
</script>

<style scoped>
.container {
  max-width: 100%;
}
</style>