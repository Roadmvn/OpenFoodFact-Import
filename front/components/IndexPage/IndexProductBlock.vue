<template>
  <div class="max-w-7xl mx-auto mt-10">
    <el-text tag="b" style="font-size: 1.2rem;">Nos Produits</el-text>
    <el-divider></el-divider>
    <!-- Liste des produits internes -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" style="height: 100%;">
      <el-card
          @click="to_route(`/products/${product.id}`)"
          shadow="hover"
          style="border-radius: 15px;cursor: pointer;display: flex;flex-direction: column;justify-content: space-between;height: 100%;align-content: space-between;"
          v-for="product in internalProducts"
          :key="product.id"
          class="bg-white shadow-lg rounded-lg overflow-hidden border hover:shadow-xl transition-shadow duration-300"
      >
        <!-- Conteneur d'image -->
        <div class="w-full h-48 bg-gray-100 flex items-center justify-center">
          <img
              :src="product.product.image_url"
              alt="Image du produit"
              class="w-auto h-full object-contain"
          />
        </div>

        <!-- Informations du produit -->
        <div class="p-4 flex-grow">
          <h3 class="text-lg font-semibold text-gray-800 truncate" title="product.product.name">
            {{ product.product.name }}
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            <strong>Marque :</strong>
            <span>{{ product.product.brand || "Marque inconnue" }}</span>
          </p>
          <p class="text-sm text-gray-600 mt-1">
            <strong>Catégories :</strong>
            <span class="italic">{{ formatCategories(product.product.categories) }}</span>
          </p>
          <p class="text-sm text-gray-600 mt-1">
            <strong>Prix :</strong>
            {{ product.price }} €
          </p>
          <p class="text-sm text-gray-600 mt-1">
            <strong>Quantité :</strong>
            {{ product.quantity }}
          </p>
          <p class="text-sm text-gray-600 mt-1">
            <strong>Vendeur :</strong>
            {{ product.seller.email }}
          </p>
        </div>

        <!-- Boutons -->
        <div class="flex justify-center items-end mt-auto mb-4">
          <el-button type="primary" class="w-3/4" @click.stop="addToCart(product)">Ajouter au panier</el-button>
        </div>
      </el-card>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center my-8">
      <el-pagination
          background
          layout="prev, pager, next, ->, total"
          :total="totalItems"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from "~/stores/cartStore.ts";

const cartStore = useCartStore();

const internalProducts = ref([]); // Liste des produits internes pour une page
const currentPage = ref(1); // Page actuelle
const pageSize = 20; // Produits par page
const totalItems = ref(0); // Nombre total de produits internes

const to_route = (route) => {
  window.location.href = route;
}

// Appeler l'API pour obtenir les produits internes
const fetchInternalProducts = async (page = 1) => {
  try {
    const { $axios } = useNuxtApp();
    const response = await $axios.get(`/api/internal-products/products_all?page=${page}`);
    internalProducts.value = response.data.internalProducts;
    totalItems.value = response.data.internalProducts.length; // Remplacer par l'attribut totalItems dans la réponse si présent
  } catch (error) {
    console.error("Erreur lors du chargement des produits internes:", error);
  }
};

// Gérer le changement de page
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchInternalProducts(page);
};

// Ajouter un produit au panier
const addToCart = (product) => {
  cartStore.addToCart(product.id)
};

// Formater les catégories
const formatCategories = (categories) => {
  return categories?.split(',').slice(0, 2).join(', ') || 'Aucune catégorie';
};

// Charger les produits internes lors du montage
onMounted(() => {
  fetchInternalProducts();
});
</script>

<style scoped>
.el-card__body {
  height: 400px;
  display: flex;
  align-content: space-between;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: column;
}
</style>