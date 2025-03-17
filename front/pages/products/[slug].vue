<template>
  <div class="max-w-7xl mx-auto mt-10 px-4">
    <!-- 产品展示卡片 -->
    <div class="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden">
      <!-- 产品图片 -->
      <div class="md:w-1/2 flex justify-center items-center bg-gray-100 p-4">
        <img
            v-if="product?.product?.image_url"
            :src="product.product.image_url"
            :alt="product.product.name"
            class="w-auto h-96 object-contain"
        />
        <div v-else class="text-gray-500">Image indisponible</div>
      </div>

      <!-- 产品详情 -->
      <div class="md:w-1/2 p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">
          {{ product?.product?.name || "Nom du produit" }}
        </h1>
        <p class="text-gray-600 mb-1">
          <strong>Prix:</strong> <span class="text-green-600">{{ product?.price || "?" }} €</span>
        </p>
        <p class="text-gray-600 mb-1">
          <strong>Quantité:</strong> {{ product?.quantity || "?" }}
        </p>
        <p class="text-gray-600 mb-4">
          <strong>Marque:</strong> {{ product?.product?.brand || "Non spécifié" }}
        </p>
        <p class="text-gray-600 mb-4">
          <strong>Catégories:</strong> <span class="italic">{{ product?.product?.categories || "Aucune catégorie" }}</span>
        </p>
        <p class="text-gray-600 mb-4">
          <strong>Vendu par:</strong> <a :href="`mailto:${product?.seller?.email}`" class="text-blue-500 underline">{{ product?.seller?.email }}</a>
        </p>

        <!-- 操作按钮 -->
        <div class="flex space-x-4">
          <el-button type="primary" size="large" @click="addToCart(product)">Ajouter au panier</el-button>
          <el-button type="success" @click="open_contact" size="large">Contact Seller</el-button>
        </div>
      </div>
    </div>
    <!-- 抽屉组件 -->
    <el-drawer
        title="Contact Form"
        v-model="drawerVisible"
        direction="rtl"
        size="30%">
      <el-form :model="form" :rules="rules" ref="contactForm" label-width="100px">
        <!-- 消息输入 -->
        <el-form-item label="Messages" prop="message">
          <el-input
              type="textarea"
              v-model="form.message"
              placeholder="Veuillez saisir vos coordonnées"
              rows="4"
          ></el-input>
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">Soumettre</el-button>
          <el-button @click="drawerVisible = false">Annuler</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import {useCartStore} from "~/stores/cartStore";
const cartStore = useCartStore();
const { $axios } = useNuxtApp()

const route = useRoute();
const product = ref<any>(null); // 产品数据

const drawerVisible = ref<boolean>(false);

const open_contact = () => {
  drawerVisible.value = true;
}

const form = reactive({
  message: "",
});

const rules = reactive({
  message: [{ required: true, message: "cant be null", trigger: "blur" }],
});

const contactForm = ref();

const current_user = useUserStore().user;

const handleSubmit = async () => {
  try {
    const response = await $axios.post("/api/contact", {
      sellerId: product.value.seller.id,
      buyerId: current_user?.id,
      message: form.message,
    });
    // 如果 API 返回响应
    ElMessage.success("Soumettre avec succès！");
    // 重置表单
    form.message = "";
    drawerVisible.value = false;
  } catch (err: any) {
    // 验证未通过或请求失败
    if (err.response) {
      ElMessage.error(`La demande a échoué：${err.response.data.message || err.message}`);
    } else {
      ElMessage.error("La soumission a échoué, veuillez vérifier le réseau ou réessayer plus tard！");
    }
  }
};

// 加载产品数据
const fetchProduct = async () => {
  try {
    const { slug } = route.params; // 从路由中获取 slug
    const { data } = await $axios.get(`/api/internal-products/products/${slug}`);
    product.value = data.product;
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    ElMessage.error("Échec du chargement du produit.");
  }
};

// 加入购物车
const addToCart = (product: any) => {
  cartStore.addToCart(product.id,1,product);
  ElMessage.success("Produit ajouté au panier.");
};

// 加入愿望清单
const addToWishlist = () => {
  ElMessage.success("Produit ajouté à la liste de souhaits.");
};

// 页面加载时获取数据
onMounted(() => {
  fetchProduct();
});
</script>

<style scoped>
/* 使用 TailwindCSS 无需额外样式 */
</style>