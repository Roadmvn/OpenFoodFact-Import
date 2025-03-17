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
        <h1 class="text-xl font-bold text-center mb-6">Liste des factures</h1>

        <!-- 表格展示 -->
        <el-table
            v-if="invoices && invoices.length > 0"
            :data="invoices"
            style="width: 100%;"
            border
            stripe
        >
          <!-- 发票 ID -->
          <el-table-column prop="id" label="ID Facture" align="center" width="120" />

          <!-- 发票编号 -->
          <el-table-column prop="invoiceNumber" label="N° de Facture" align="center" />

          <!-- 订单 ID -->
          <el-table-column prop="orderId" label="ID Commande" align="center" />

          <!-- 总金额 -->
          <el-table-column prop="totalAmount" label="Montant Total (€)" align="center" />

          <!-- 发票状态 -->
          <el-table-column label="Statut" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'paid' ? 'success' : 'warning'">
                {{ formatStatus(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 创建时间 -->
          <el-table-column prop="createdAt" label="Date Création" align="center" />

          <!-- 操作：导出PDF按钮 -->
          <el-table-column label="Actions" align="center" width="150">
            <template #default="scope">
              <el-button
                  type="primary"
                  size="small"
                  @click="exportFormattedPdf(scope.row)"
              >
                Exporter PDF
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 如果没有发票 -->
        <div v-else class="text-center text-gray-500 mt-6">
          Aucune facture disponible.
        </div>
      </div>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
const { $axios } = useNuxtApp();
import jsPDF from 'jspdf';
import { ElMessage } from 'element-plus';
import MenuComponent from "~/components/AdminPage/MenuComponent.vue";

// 定义发票数据类型
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

// 发票数据存储
const invoices = ref<Invoice[]>([]);

// 定义 API 请求以获取发票数据
const fetchInvoices = async () => {
  try {
    const response = await $axios.get('/api/invoice');
    invoices.value = response.data; // 通过 Axios 加载发票数据
  } catch (error) {
    console.error('Erreur lors de la récupération des factures :', error);
    ElMessage.error('Impossible de charger les factures.');
  }
};

// 导出发票为 PDF
const exportFormattedPdf = (invoice: Invoice) => {
  try {
    const pdf = new jsPDF();
    let yPosition = 10;

    // 标题部分
    pdf.setFontSize(16);
    pdf.text(`Facture N°: ${invoice.invoiceNumber}`, 10, yPosition);
    yPosition += 10;

    // 发票详细信息
    pdf.setFontSize(12);
    pdf.text(`Date de création : ${formatDate(invoice.createdAt)}`, 10, yPosition);
    yPosition += 10;
    pdf.text(`Statut : ${formatStatus(invoice.status)}`, 10, yPosition);
    yPosition += 10;
    pdf.text(`Total : ${invoice.totalAmount}€`, 10, yPosition);
    yPosition += 10;

    // 买方信息
    pdf.text('Acheteur :', 10, yPosition);
    yPosition += 10;
    pdf.text(
        `${invoice.order.buyer.firstName} ${invoice.order.buyer.lastName} (${invoice.order.buyer.email})`,
        20,
        yPosition
    );
    yPosition += 10;

    // 卖方信息
    pdf.text('Vendeur :', 10, yPosition);
    yPosition += 10;
    pdf.text(
        `${invoice.order.seller.firstName} ${invoice.order.seller.lastName} (${invoice.order.seller.email})`,
        20,
        yPosition
    );
    yPosition += 10;

    // 产品标题
    pdf.text('Produits :', 10, yPosition);
    yPosition += 10;

    // 产品详细列表
    invoice.order.items.forEach((item, index) => {
      const productInfo = `${index + 1}. ${item.internalProduct.product.name} - Quantité : ${item.quantity} - Prix Unitaire : ${item.unitPrice}€ - Sous-total : ${item.subtotal}€`;
      pdf.text(productInfo, 10, yPosition);
      yPosition += 10;
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 10;
      }
    });

    // 保存 PDF 文件
    pdf.save(`facture-${invoice.invoiceNumber}.pdf`);
    ElMessage.success('Facture exportée en PDF.');
  } catch (error: any) {
    console.error('Erreur lors de l’exportation du PDF :', error);
    ElMessage.error(error.message || 'Erreur lors de l’exportation du PDF.');
  }
};

// 辅助函数：格式化日期
const formatDate = (date: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('fr-FR', options);
};

// 辅助函数：格式化状态
const formatStatus = (status: string): string => {
  const statuses: Record<string, string> = {
    paid: 'Payé',
    pending: 'En attente',
    cancelled: 'Annulé',
  };
  return statuses[status] || status;
};

// 页面挂载时获取发票数据
onMounted(fetchInvoices);
</script>

<style scoped>
.container {
  max-width: 100%  ;
}
</style>