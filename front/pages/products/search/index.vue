<template>
  <div class="search-page p-6 max-w-7xl mx-auto">
    <!-- En-tête de la page -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        Recherche de produits
      </h1>
      <p class="text-gray-600">
        Trouvez facilement les produits qui correspondent à vos critères
      </p>
    </div>

    <!-- Formulaire de recherche -->
    <div
      class="search-form bg-white p-6 rounded-lg shadow-lg mb-10 border border-gray-100 transition-all duration-300 hover:shadow-xl"
    >
      <form @submit.prevent="handleSearch" class="space-y-6">
        <!-- Champs de recherche -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Nom du produit -->
          <div class="form-group">
            <label for="name" class="block font-medium text-gray-700 mb-1"
              >Nom du produit</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
              >
                <i class="fas fa-search"></i>
              </span>
              <input
                v-model="searchParams.name"
                type="text"
                id="name"
                placeholder="Entrez le nom du produit"
                class="input-field pl-10"
              />
            </div>
          </div>

          <!-- Marque -->
          <div class="form-group">
            <label for="brand" class="block font-medium text-gray-700 mb-1"
              >Marque</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
              >
                <i class="fas fa-tag"></i>
              </span>
              <input
                v-model="searchParams.brand"
                type="text"
                id="brand"
                placeholder="Entrez la marque"
                class="input-field pl-10"
              />
            </div>
          </div>

          <!-- Catégories -->
          <div class="form-group">
            <label for="categories" class="block font-medium text-gray-700 mb-1"
              >Catégories</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
              >
                <i class="fas fa-folder"></i>
              </span>
              <input
                v-model="searchParams.categories"
                type="text"
                id="categories"
                placeholder="Entrez la catégorie"
                class="input-field pl-10"
              />
            </div>
          </div>

          <!-- Prix -->
          <div class="form-group">
            <label for="price" class="block font-medium text-gray-700 mb-1"
              >Prix</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
              >
                <i class="fas fa-euro-sign"></i>
              </span>
              <input
                v-model="searchParams.price"
                type="text"
                id="price"
                placeholder="Entrez le prix"
                class="input-field pl-10"
              />
            </div>
          </div>

          <!-- ID du vendeur -->
          <div class="form-group">
            <label for="sellerId" class="block font-medium text-gray-700 mb-1"
              >ID du vendeur</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
              >
                <i class="fas fa-user"></i>
              </span>
              <input
                v-model="searchParams.sellerId"
                type="text"
                id="sellerId"
                placeholder="Entrez l'ID du vendeur"
                class="input-field pl-10"
              />
            </div>
          </div>

          <!-- Étiquettes -->
          <div class="form-group">
            <label for="labels" class="block font-medium text-gray-700 mb-1"
              >Étiquettes</label
            >
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
              >
                <i class="fas fa-tags"></i>
              </span>
              <input
                v-model="searchParams.labels"
                type="text"
                id="labels"
                placeholder="Entrez les étiquettes"
                class="input-field pl-10"
              />
            </div>
          </div>
        </div>

        <!-- Bouton de recherche -->
        <div class="mt-6 flex justify-center">
          <button
            type="submit"
            class="btn-primary px-8 py-3 flex items-center gap-2 transform hover:scale-105"
          >
            <i class="fas fa-search"></i>
            Rechercher
          </button>
        </div>
      </form>
    </div>

    <!-- Affichage des résultats -->
    <div
      v-if="results.length > 0"
      class="search-results mt-8 transition-opacity duration-500 ease-in-out"
    >
      <h3 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        Résultats de la recherche
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="result in results"
          :key="result.id"
          class="result-item bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          @click="to_route(`/products/${result.id}`)"
        >
          <div class="relative overflow-hidden rounded-lg mb-4 h-48">
            <img
              :src="
                result.product.image_url || 'https://via.placeholder.com/150'
              "
              alt="product image"
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
            <div
              class="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs"
            >
              {{ result.price }} €
            </div>
          </div>
          <h4 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {{ result.product.name }}
          </h4>
          <div class="space-y-1 mb-4">
            <p class="text-sm flex items-center text-gray-600">
              <i class="fas fa-tag mr-2"></i> {{ result.product.brand }}
            </p>
            <p class="text-sm flex items-center text-gray-600">
              <i class="fas fa-folder mr-2"></i> {{ result.product.categories }}
            </p>
            <p class="text-sm flex items-center text-gray-600">
              <i class="fas fa-box mr-2"></i> Stock: {{ result.quantity }}
            </p>
          </div>
          <button
            class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <i class="fas fa-eye"></i> Voir le détail
          </button>
        </div>
      </div>
    </div>

    <!-- Si aucun résultat -->
    <div
      v-if="results.length === 0 && searched"
      class="text-center mt-12 p-8 bg-gray-50 rounded-lg shadow-md"
    >
      <i class="fas fa-search text-gray-400 text-5xl mb-4"></i>
      <p class="text-xl text-gray-600 mb-2">
        Aucun produit correspondant trouvé
      </p>
      <p class="text-gray-500">
        Veuillez modifier vos critères de recherche et réessayer.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const { $axios } = useNuxtApp();

// Paramètres de recherche
const searchParams = ref({
  name: "",
  brand: "",
  categories: "",
  price: "",
  sellerId: "",
  labels: "",
});

const to_route = (path: string) => {
  window.location.href = path;
};

// Résultats de la recherche
const results = ref([]);
const searched = ref(false);

// Fonction pour effectuer la recherche
const handleSearch = async () => {
  try {
    // Effectuer une requête GET vers l'API
    const response = await $axios.get(
      "/api/internal-products/products_search",
      {
        params: searchParams.value, // Transmettre les paramètres de recherche à l'API
      }
    );

    // Mettre à jour les résultats obtenus
    results.value = response.data.results;
    searched.value = true;
  } catch (error) {
    console.error("La recherche a échoué :", error);
    searched.value = true;
    results.value = [];
  }
};
</script>

<style scoped>
/* Styles des champs de formulaire */
.input-field {
  width: 100%;
  padding: 10px 12px;
  margin-top: 4px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s;
  background-color: #f9fafb;
  font-size: 0.95rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  background-color: white;
}

/* Styles des boutons */
.btn-primary {
  background-color: #3b82f6;
  color: #fff;
  font-weight: 600;
  text-align: center;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover {
  background-color: #2563eb;
  box-shadow: 0 6px 8px rgba(37, 99, 235, 0.3);
}

.form-group {
  transition: transform 0.2s;
}

.form-group:hover {
  transform: translateY(-2px);
}

.search-page {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-item {
  cursor: pointer;
}

/* Effet de ligne tronquée pour les textes longs */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
