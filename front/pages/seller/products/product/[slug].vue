<template>
  <div class="max-w-4xl mx-auto mt-8">
    <el-card class="shadow-lg">
      <h2 class="text-xl font-bold mb-4">Produit Détail & Modifier</h2>

      <!-- 产品详情(不可编辑) -->
      <div v-if="productDetail" class="mb-6">
        <el-descriptions title="Détails du Produit" class="border p-4">
          <el-descriptions-item label="Nom">{{ productDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="Code">{{ productDetail.code }}</el-descriptions-item>
          <el-descriptions-item label="Marque">{{ productDetail.brand }}</el-descriptions-item>
          <el-descriptions-item label="Catégories">{{ productDetail.categories }}</el-descriptions-item>
          <el-descriptions-item label="Quantité">{{ productDetail.quantity }}</el-descriptions-item>
          <el-descriptions-item label="Labels">{{ productDetail.labels }}</el-descriptions-item>
          <el-descriptions-item label="Image">
            <img :src="productDetail.image_url" alt="Product Image" class="w-32 h-auto" />
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 库存(允许修改价格和数量) -->
      <div v-if="internalProduct" class="border p-4 rounded-lg bg-gray-100 shadow-inner">
        <el-form :model="editableProduct" :rules="rules" ref="formRef" label-position="top" label-width="120px">
          <el-row :gutter="20">
            <!-- ID -->
            <el-col :span="12">
              <el-form-item label="ID Produit" prop="id">
                <el-input v-model="editableProduct.id" disabled />
              </el-form-item>
            </el-col>

            <!-- Prix -->
            <el-col :span="12">
              <el-form-item label="Prix (€)" prop="price">
                <el-input v-model="editableProduct.price" placeholder="Entrez le prix" type="number" />
              </el-form-item>
            </el-col>

            <!-- Quantité -->
            <el-col :span="12">
              <el-form-item label="Quantité" prop="quantity">
                <el-input v-model="editableProduct.quantity" placeholder="Entrez la quantité" type="number" />
              </el-form-item>
            </el-col>

            <!-- Boutons -->
            <el-col :span="24" class="text-right mt-4">
              <el-button type="primary" @click="handleUpdate" :loading="isUpdating">Mettre à jour</el-button>
              <el-button type="default" @click="resetForm">Réinitialiser</el-button>
              <el-button type="danger" @click="confirmDelete" class="ml-2">Supprimer</el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {useRoute} from "vue-router";
const { $axios } = useNuxtApp();

interface ProductDetail {
  id: number;
  code: string;
  name: string;
  brand: string;
  categories: string;
  labels: string;
  quantity: string;
  image_url: string;
  image_nutrition_url?: string;
  [key: string]: any; // 如果还有其他字段，但具体不明确
}

// 数据管理
const internalProduct = ref(null); // 库存相关数据
const productDetail = ref<ProductDetail | null>(null);

const isUpdating = ref(false); // 更新状态

// 表单编辑数据
const editableProduct = reactive({
  id: null,
  price: null,
  quantity: null,
});

// 表单规则
const rules = {
  price: [
    { required: true, message: "Le prix est obligatoire.", trigger: "blur" },
    {
      validator: (rule: any, value: number, callback: Function) => {
        if (!value || isNaN(value)) callback(new Error("Le prix doit être un nombre valide."));
        else if (value <= 0) callback(new Error("Le prix doit être supérieur à 0."));
        else callback();
      },
      trigger: "change",
    },
  ],
  quantity: [
    { required: true, message: "La quantité est obligatoire.", trigger: "blur" },
  ],
};

const route = useRoute();

// 初始化加载数据
const loadProductData = async () => {
  try {
    // 第一步：获取 internalProduct 数据
    const internalRes = await $axios.get(`/api/internal-products/products/${route.params.slug}`);
    internalProduct.value = internalRes.data.product;

    // 第二步：根据 internalProduct 的 productId 获取 product 数据
    const productId = internalProduct.value.productId; // 从 internalProduct 提取 productId
    const detailRes = await $axios.get(`/api/products/product/${productId}`);
    productDetail.value = detailRes.data;

    // 初始化表单可编辑数据
    editableProduct.id = internalProduct.value.id;
    editableProduct.price = parseFloat(internalProduct.value.price);
    editableProduct.quantity = internalProduct.value.quantity;
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    ElMessage.error("Impossible de charger les données du produit.");
  }
};

// 删除确认
const confirmDelete = () => {
  ElMessageBox.confirm(
      "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
      "Attention",
      {
        confirmButtonText: "Confirmer",
        cancelButtonText: "Annuler",
        type: "warning",
      }
  )
      .then(() => {
        handleDelete();
      })
      .catch(() => {
        ElMessage.info("Suppression annulée.");
      });
};

// 删除操作
const handleDelete = async () => {
  try {
    const id = editableProduct.id;

    // 调用删除 API
    const response = await $axios.delete(`/api/internal-products/${route.params.slug}`);

    if (response.status === 200) {
      ElMessage.success("Produit supprimé avec succès !");
      window.location.href = '/seller/products';
    }
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    ElMessage.error("Erreur lors de la suppression du produit.");
  }
};

// 提交更新
const handleUpdate = async () => {
  try {
    const valid = await validateForm(); // 验证表单
    if (!valid) return;

    isUpdating.value = true;

    // 调用更新 API
    const response = await $axios.put(
        `/api/internal-products/${editableProduct.id}`,
        {
          price: editableProduct.price,
          quantity: editableProduct.quantity,
        }
    );

    // 更新成功处理
    if (response.status === 200) {
      ElMessage.success("Produit mis à jour avec succès !");
      internalProduct.value.price = editableProduct.price;
      internalProduct.value.quantity = editableProduct.quantity;
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    ElMessage.error("Erreur lors de la mise à jour du produit.");
  } finally {
    isUpdating.value = false;
  }
};

// 表单重置
const resetForm = () => {
  editableProduct.price = parseFloat(internalProduct.value.price);
  editableProduct.quantity = internalProduct.value.quantity;
};

// 表单验证
const validateForm = async () => {
  const formRef = ref(null);
  try {
    await formRef.value?.validate();
    return true;
  } catch {
    return false;
  }
};

// 页面加载时初始化
onMounted(async () => {
  await loadProductData();
});
</script>