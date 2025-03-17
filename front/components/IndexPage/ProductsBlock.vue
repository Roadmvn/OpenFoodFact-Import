<template>
  <div class="max-w-7xl mx-auto mt-10">
    <!-- Liste des produits -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" style="height: 100%;">
      <el-card
          @click="to_product(product.id)"
          shadow="hover"
          style="border-radius: 15px;cursor: pointer;display: flex;flex-direction: column;justify-content: space-between;height: 100%;align-content: space-between;"
          v-for="product in products"
          :key="product.id"
          class="bg-white shadow-lg rounded-lg overflow-hidden border hover:shadow-xl transition-shadow duration-300"
      >
        <!-- Conteneur d'image -->
        <div class="w-full h-48 bg-gray-100 flex items-center justify-center">
          <img
              :src="product.image_url"
              alt="Image du produit"
              class="w-auto h-full object-contain"
          />
        </div>

        <!-- Informations du produit -->
        <div class="p-4 flex-grow">
          <h3
              class="text-lg font-semibold text-gray-800 truncate"
              title="product.name"
          >
            {{ product.name }}
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            <strong>Marque:</strong>
            <span>{{ product.brand || "Marque inconnue" }}</span>
          </p>
          <p class="text-sm text-gray-600 mt-1">
            <strong>Catégories:</strong>
            <span class="italic">{{ formatCategories(product.categories) }}</span>
          </p>

          <!-- Ligne de séparation -->
          <hr class="my-4 border-gray-300" />

          <!-- Informations nutritionnelles -->
          <div class="text-sm text-gray-600 mt-2 space-y-1">
            <p v-if="product.energy_kcal">Énergie: {{ product.energy_kcal }} kcal</p>
            <p v-if="product.fat">Graisse: {{ product.fat }} g</p>
            <p v-if="product.sugars">Sucre: {{ product.sugars }} g</p>
            <p v-if="product.salt">Sel: {{ product.salt }} g</p>
          </div>
        </div>

        <!-- Bouton -->
        <div class="flex justify-center items-end mt-auto mb-4">
          <el-button type="primary" class="w-3/4">Edit</el-button>
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
<style scoped>
.el-card__body{
  height: 400px;
  display: flex;
  align-content: space-between;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: column;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const products = ref([]) // Liste des produits pour une page
const currentPage = ref(1) // Page actuelle
const pageSize = 20 // Produits par page
const totalItems = ref(0) // Nombre total de produits

const { $axios } = useNuxtApp()

// Appeler l'API pour obtenir les produits
const fetchProducts = async (page = 1) => {
  try {
    const response = await $axios.get(`/api/products/products?page=${page}`)
    products.value = response.data.products
    totalItems.value = response.data.totalItems
  } catch (error) {
    console.error("Erreur lors du chargement des produits:", error)
  }
}

// Gérer le changement de page
const handlePageChange = (page) => {
  currentPage.value = page
  fetchProducts(page)
}

const to_product = (id) => {
  window.location.href = `/admin/products/product/${id}`
}

// Formater les catégories
const formatCategories = (categories) => {
  return categories?.split(',').slice(0, 2).join(', ') || 'Aucune catégorie'
}

// Charger les produits lors du montage
onMounted(() => {
  fetchProducts()
})
</script>