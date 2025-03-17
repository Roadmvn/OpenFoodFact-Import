<template>
  <div class="search-page p-6">
    <!-- Formulaire de recherche -->
    <div class="search-form bg-gray-100 p-4 rounded-md shadow-md">
      <h2 class="text-2xl font-bold mb-4">Recherche de produits</h2>

      <form @submit.prevent="handleSearch">
        <!-- Champs de recherche -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Nom du produit -->
          <div>
            <label for="name" class="block font-medium">Nom du produit</label>
            <input
                v-model="searchParams.name"
                type="text"
                id="name"
                placeholder="Entrez le nom du produit"
                class="input-field"
            />
          </div>

          <!-- Marque -->
          <div>
            <label for="brand" class="block font-medium">Marque</label>
            <input
                v-model="searchParams.brand"
                type="text"
                id="brand"
                placeholder="Entrez la marque"
                class="input-field"
            />
          </div>

          <!-- Catégories -->
          <div>
            <label for="categories" class="block font-medium">Catégories</label>
            <input
                v-model="searchParams.categories"
                type="text"
                id="categories"
                placeholder="Entrez la catégorie"
                class="input-field"
            />
          </div>

          <!-- Prix -->
          <div>
            <label for="price" class="block font-medium">Prix</label>
            <input
                v-model="searchParams.price"
                type="text"
                id="price"
                placeholder="Entrez le prix"
                class="input-field"
            />
          </div>

          <!-- ID du vendeur -->
          <div>
            <label for="sellerId" class="block font-medium">ID du vendeur</label>
            <input
                v-model="searchParams.sellerId"
                type="text"
                id="sellerId"
                placeholder="Entrez l'ID du vendeur"
                class="input-field"
            />
          </div>

          <!-- Étiquettes -->
          <div>
            <label for="labels" class="block font-medium">Étiquettes</label>
            <input
                v-model="searchParams.labels"
                type="text"
                id="labels"
                placeholder="Entrez les étiquettes"
                class="input-field"
            />
          </div>
        </div>

        <!-- Bouton de recherche -->
        <div class="mt-6">
          <button type="submit" class="btn-primary w-full">
            Rechercher
          </button>
        </div>
      </form>
    </div>

    <!-- Affichage des résultats -->
    <div v-if="results.length > 0" class="search-results mt-8">
      <h3 class="text-xl font-bold mb-4">Résultats de la recherche :</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
            style="cursor: pointer;"
            v-for="result in results"
            :key="result.id"
            class="result-item bg-white p-4 rounded-md shadow-sm"
            @click="to_route(`/products/${result.id}`)"
        >
          <img
              :src="result.product.image_url || 'https://via.placeholder.com/150'"
              alt="product image"
              class="w-full h-40 object-cover rounded-md"
          />
          <h4 class="text-lg font-semibold mt-4">{{ result.product.name }}</h4>
          <p class="text-sm text-gray-500">Marque : {{ result.product.brand }}</p>
          <p class="text-sm text-gray-500">Catégorie : {{ result.product.categories }}</p>
          <p class="text-sm text-gray-500">Prix : {{ result.price }}</p>
          <p class="text-sm text-gray-500">Quantité en stock : {{ result.quantity }}</p>
          <el-button type="primary">Voir</el-button>
        </div>
      </div>
    </div>
    <!-- Si aucun résultat -->
    <div v-if="results.length === 0 && searched" class="text-center mt-8">
      <p class="text-lg text-gray-600">Aucun produit correspondant trouvé, veuillez modifier les critères de recherche.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const { $axios } = useNuxtApp();

// Paramètres de recherche
const searchParams = ref({
  name: '',
  brand: '',
  categories: '',
  price: '',
  sellerId: '',
  labels: '',
});

const to_route = (path: string) => {
  window.location.href = path;
}

// Résultats de la recherche
const results = ref([]);
const searched = ref(false);

// Fonction pour effectuer la recherche
const handleSearch = async () => {
  try {
    // Effectuer une requête GET vers l'API
    const response = await $axios.get('/api/internal-products/products_search', {
      params: searchParams.value, // Transmettre les paramètres de recherche à l'API
    });

    // Mettre à jour les résultats obtenus
    results.value = response.data.results;
    searched.value = true;
  } catch (error) {
    console.error('La recherche a échoué :', error);
    searched.value = true;
    results.value = [];
  }
};
</script>

<style scoped>
/* Styles des champs de formulaire */
.input-field {
  width: 100%;
  padding: 8px 12px;
  margin-top: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #007bff;
}

/* Styles des boutons */
.btn-primary {
  background-color: #007bff;
  color: #fff;
  font-weight: bold;
  text-align: center;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>