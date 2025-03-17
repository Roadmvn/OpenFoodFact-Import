<template>
  <div class="p-4 flex flex-col items-center">
    <!-- Titre principal -->
    <h1 class="text-2xl font-bold mb-6">Modifier les informations du produit</h1>

    <!-- Chargement -->
    <div v-if="chargement" class="text-center text-xl">
      Chargement en cours...
    </div>

    <!-- Formulaire -->
    <el-form
        v-else
        :model="produitFormulaire"
        :rules="regles"
        label-width="150px"
        class="w-full max-w-4xl"
    >
      <!-- Champ : Code -->
      <el-form-item label="Code">
        <el-input v-model="produitFormulaire.code" placeholder="Code du produit" />
      </el-form-item>

      <!-- Champ : Code-barres -->
      <el-form-item label="Code-barres">
        <div class="flex flex-col space-y-2">
          <el-input v-model="produitFormulaire.barcode" placeholder="Code-barres du produit" />
          <div v-if="produitFormulaire.barcode" class="flex justify-center">
            <svg id="barcode"></svg>
          </div>
        </div>
      </el-form-item>

      <!-- Champ : Nom -->
      <el-form-item label="Nom" prop="name">
        <el-input v-model="produitFormulaire.name" placeholder="Nom du produit" />
      </el-form-item>

      <!-- Champ : Marque -->
      <el-form-item label="Marque">
        <el-input v-model="produitFormulaire.brand" placeholder="Marque du produit" />
      </el-form-item>

      <!-- Champ : Catégories -->
      <el-form-item label="Catégories">
        <el-input
            v-model="produitFormulaire.categories"
            placeholder="Catégories (séparées par une virgule)"
        />
      </el-form-item>

      <!-- Champ : Labels -->
      <el-form-item label="Labels">
        <el-input v-model="produitFormulaire.labels" placeholder="Labels du produit" />
      </el-form-item>

      <!-- Champ : Quantité -->
      <el-form-item label="Quantité">
        <el-input v-model="produitFormulaire.quantity" placeholder="Quantité" />
      </el-form-item>

      <!-- Champ : Image produit -->
      <el-form-item label="Image du produit">
        <img
            :src="produitFormulaire.image_url"
            alt="Image du produit"
            class="max-w-xs max-h-64 mb-4"
        />
        <el-input v-model="produitFormulaire.image_url" placeholder="Lien de l'image" />
      </el-form-item>

      <!-- Separator pour les informations nutritionnelles -->
      <el-divider>Informations nutritionnelles</el-divider>

      <!-- Champ : Énergie -->
      <el-form-item label="Énergie (kcal)">
        <el-input
            v-model="produitFormulaire.energy_kcal"
            placeholder="Énergie (en kcal)"
            type="number"
        />
      </el-form-item>

      <!-- Champ : Graisses -->
      <el-form-item label="Graisses (en g)">
        <el-input
            v-model="produitFormulaire.fat"
            placeholder="Quantité de graisses (en g)"
            type="number"
        />
      </el-form-item>

      <!-- Champ : Graisses saturées -->
      <el-form-item label="Graisses saturées (en g)">
        <el-input
            v-model="produitFormulaire.saturated_fat"
            placeholder="Graisses saturées (en g)"
            type="number"
        />
      </el-form-item>

      <!-- Champ : Sucres -->
      <el-form-item label="Sucres (en g)">
        <el-input
            v-model="produitFormulaire.sugars"
            placeholder="Quantité de sucres (en g)"
            type="number"
        />
      </el-form-item>

      <!-- Champ : Sel -->
      <el-form-item label="Sel (en g)">
        <el-input
            v-model="produitFormulaire.salt"
            placeholder="Quantité de sel (en g)"
            type="number"
        />
      </el-form-item>

      <!-- Champ : Protéines -->
      <el-form-item label="Protéines (en g)">
        <el-input
            v-model="produitFormulaire.proteins"
            placeholder="Quantité de protéines (en g)"
            type="number"
        />
      </el-form-item>

      <!-- Bouton de soumission -->
      <el-form-item>
        <el-button
            type="primary"
            @click="mettreAJourProduit"
            :loading="enCoursDeMiseAJour"
            class="w-full"
        >
          Sauvegarder les modifications
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import JsBarcode from 'jsbarcode';

const { $axios } = useNuxtApp();
const route = useRoute();

// Données et états
const produitFormulaire = ref({
  id: null,
  code: "",
  barcode: "",
  name: "",
  brand: "",
  categories: "",
  labels: "",
  quantity: "",
  image_url: "",
  energy_kcal: null,
  fat: null,
  saturated_fat: null,
  sugars: null,
  salt: null,
  proteins: null,
});
const chargement = ref(true); // État de chargement
const enCoursDeMiseAJour = ref(false); // État de la mise à jour

// Règles de validation
const regles = {
  name: [{ required: true, message: "Veuillez entrer le nom du produit", trigger: "blur" }],
};

// Fonction pour récupérer les données du produit
const chargerProduit = async () => {
  try {
    chargement.value = true;

    const response = await $axios.get(`/api/products/product/${route.params.slug}`);

    produitFormulaire.value = response.data; // Charger les données dans le formulaire
    
    // Si le barcode n'est pas défini mais que le code existe, utiliser le code comme barcode par défaut
    if (!produitFormulaire.value.barcode && produitFormulaire.value.code) {
      produitFormulaire.value.barcode = produitFormulaire.value.code;
    }
    
    return response;
  } catch (error) {
    ElMessage.error("Impossible de charger les informations du produit !");
    console.error("Erreur de chargement du produit:", error);
  } finally {
    chargement.value = false;
  }
};

// Fonction pour mettre à jour le produit
const mettreAJourProduit = async () => {
  try {
    enCoursDeMiseAJour.value = true;

    // Préparer les données à envoyer
    const donnees = { ...produitFormulaire.value };
    delete donnees.id; // On ne modifie pas l'ID
    delete donnees.createdAt; // Ignorer ce champ
    delete donnees.updatedAt; // Ignorer ce champ

    const response = await $axios.put(`/api/products/${route.params.slug}`, donnees);

    if (response.status === 200) {
      ElMessage.success("Produit mis à jour avec succès !");
      await chargerProduit(); // Recharger les données
    } else {
      ElMessage.error("Erreur lors de la mise à jour !");
    }
  } catch (error) {
    ElMessage.error("Erreur lors de la mise à jour du produit !");
    console.error("Erreur de mise à jour:", error);
  } finally {
    enCoursDeMiseAJour.value = false;
  }
};

// Fonction pour générer le code-barres
const genererCodeBarres = () => {
  if (produitFormulaire.value.barcode) {
    try {
      setTimeout(() => {
        const barcodeElement = document.getElementById('barcode');
        if (barcodeElement) {
          JsBarcode("#barcode", produitFormulaire.value.barcode, {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: 50,
            displayValue: true,
            fontSize: 12,
            margin: 10
          });
        }
      }, 100);
    } catch (error) {
      console.error("Erreur lors de la génération du code-barres:", error);
    }
  }
};

// Surveiller les changements du code-barres pour régénérer le SVG
watch(() => produitFormulaire.value.barcode, () => {
  genererCodeBarres();
});

// Charger les données au montage
onMounted(() => {
  chargerProduit().then(() => {
    genererCodeBarres();
  });
});
</script>