<template>
  <div class="invoice-detail container mx-auto p-6">
    <!-- 页面标题 -->
    <el-card class="mb-6">
      <h1 class="text-xl font-bold text-center mb-4">Détails de la facture</h1>
    </el-card>

    <!-- 循环展示发票 -->
    <el-card
        v-for="invoice in invoices"
        :key="invoice.id"
        class="invoice mb-6 shadow-lg border"
    >
      <!-- 发票内容 -->
      <div class="invoice-content">
        <!-- 发票头部 -->
        <div class="invoice-header border-b pb-4 mb-4">
          <h2 class="text-lg font-bold">Facture N°: {{ invoice.invoiceNumber }}</h2>
          <p>Date de création : {{ formatDate(invoice.createdAt) }}</p>
          <p>Total : <span class="font-semibold">{{ invoice.totalAmount }}€</span></p>
          <p>Status : <span class="capitalize font-semibold">{{ formatStatus(invoice.status) }}</span></p>
        </div>

        <!-- 买家和卖家信息 -->
        <div class="order-info mb-4">
          <el-card class="mb-4 bg-gray-50">
            <p>
              <strong>Acheteur :</strong>
              {{ invoice.order.buyer.firstName }} {{ invoice.order.buyer.lastName }}
            </p>
            <p>Email : {{ invoice.order.buyer.email }}</p>
          </el-card>
          <el-card class="bg-gray-50">
            <p>
              <strong>Vendeur :</strong>
              {{ invoice.order.seller.firstName }} {{ invoice.order.seller.lastName }}
            </p>
            <p>Email : {{ invoice.order.seller.email }}</p>
          </el-card>
        </div>

        <!-- 产品列表 -->
        <div class="product-list">
          <h3 class="text-lg font-semibold mb-4">Produits</h3>
          <div class="products grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-card
                v-for="item in invoice.order.items"
                :key="item.id"
                class="product-item p-4"
            >
              <img
                  :src="item.internalProduct.product.image_url"
                  alt="Image du produit"
                  class="w-24 h-24 rounded border mb-2"
              />
              <p><strong>Nom :</strong> {{ item.internalProduct.product.name }}</p>
              <p><strong>Quantité :</strong> {{ item.quantity }}</p>
              <p><strong>Prix Unitaire :</strong> {{ item.unitPrice }}€</p>
              <p><strong>Sous-total :</strong> {{ item.subtotal }}€</p>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 导出 PDF 按钮 -->
      <div class="export-pdf-button text-right mt-4">
        <el-button type="primary" @click="exportFormattedPdf(invoice)">
          Exporter Facture en PDF
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import jsPDF from 'jspdf';
import { ElMessage } from 'element-plus';

// 定义接口类型
interface Product {
  id: number;
  name: string;
  image_url: string;
}

interface InternalProduct {
  sellerId: number;
  product: Product;
}

interface OrderItem {
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
  sellerId: number;
  status: string;
  totalAmount: string;
  buyer: User;
  seller: User;
  items: OrderItem[];
}

interface Invoice {
  id: number;
  orderId: number;
  invoiceNumber: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  order: Order;
}

// 使用 Nuxt 的 Axios 插件
const { $axios } = useNuxtApp();

// 数据存储
const invoices = ref<Invoice[]>([]);

// 获取发票数据
const fetchInvoices = async () => {
  try {
    const response = await $axios.get('/api/invoice/user/me');
    invoices.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des factures:', error);
    ElMessage.error('Impossible de charger les factures.');
  }
};

// 导出格式化 PDF
const exportFormattedPdf = (invoice: Invoice) => {
  try {
    const pdf = new jsPDF();

    // 标题部分
    pdf.setFontSize(16);
    pdf.text(`Facture N°: ${invoice.invoiceNumber}`, 10, 10);

    // 日期和状态
    pdf.setFontSize(12);
    pdf.text(`Date de création : ${formatDate(invoice.createdAt)}`, 10, 20);
    pdf.text(`Status : ${formatStatus(invoice.status)}`, 10, 30);
    pdf.text(`Total : ${invoice.totalAmount}€`, 10, 40);

    // 买家和卖家信息
    pdf.text('Acheteur :', 10, 50);
    pdf.text(`${invoice.order.buyer.firstName} ${invoice.order.buyer.lastName} (${invoice.order.buyer.email})`, 20, 60);

    pdf.text('Vendeur :', 10, 70);
    pdf.text(`${invoice.order.seller.firstName} ${invoice.order.seller.lastName} (${invoice.order.seller.email})`, 20, 80);

    // 产品列表标题
    pdf.text('Produits :', 10, 90);

    // 产品列表内容
    let y = 100;
    invoice.order.items.forEach((item, index) => {
      pdf.text(
          `${index + 1}. ${item.internalProduct.product.name} - Quantité: ${item.quantity} - Prix: ${item.unitPrice}€ - Sous-total: ${item.subtotal}€`,
          10,
          y
      );
      y += 10;
    });

    // 下载 PDF
    pdf.save(`facture-${invoice.invoiceNumber}.pdf`);
    ElMessage.success('Facture exportée en PDF.');
  } catch (error: any) {
    console.error('Erreur lors de la génération du PDF:', error);
    ElMessage.error(error.message || 'Erreur lors de l’exportation PDF.');
  }
};

// 辅助方法：格式化日期
const formatDate = (date: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('fr-FR', options);
};

// 辅助方法：格式化状态
const formatStatus = (status: string): string => {
  const statuses: Record<string, string> = {
    paid: 'Payé',
    pending: 'En attente',
    cancelled: 'Annulé',
  };
  return statuses[status] || status;
};

// 页面挂载时调用
onMounted(fetchInvoices);
</script>

<style scoped>
.invoice-detail {
  max-width: 960px;
}

.product-item img {
  border-radius: 4px;
  border: 1px solid #e6e6e6;
}
</style>