<template>
  <el-dialog
    v-model="dialogVisible"
    title="Scanner ce QR code"
    width="90%"
    max-width="400px"
    :close-on-click-modal="true"
    :show-close="true"
    center
  >
    <div class="barcode-modal-content">
      <BarcodeGenerator
        :value="code"
        :width="200"
        :height="200"
        :margin="10"
        errorCorrectionLevel="H"
      />
      <div class="barcode-instructions">
        <p>Utilisez l'application mobile pour scanner ce QR code et ajouter le produit à votre panier.</p>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">Fermer</el-button>
        <el-button type="primary" @click="downloadBarcode">
          Télécharger
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import BarcodeGenerator from './BarcodeGenerator.vue';
import html2canvas from 'html2canvas';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  code: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    default: 'Produit'
  }
});

const emit = defineEmits(['update:visible']);

const dialogVisible = ref(props.visible);

// Synchroniser l'état de visibilité avec les props
watch(() => props.visible, (newValue) => {
  dialogVisible.value = newValue;
});

// Émettre l'événement de mise à jour lorsque le dialogue est fermé
watch(() => dialogVisible.value, (newValue) => {
  if (props.visible !== newValue) {
    emit('update:visible', newValue);
  }
});

// Fermer le dialogue
const closeDialog = () => {
  dialogVisible.value = false;
};

// Télécharger le QR code comme image
const downloadBarcode = async () => {
  try {
    // Sélectionner l'élément contenant le QR code
    const element = document.querySelector('.barcode-modal-content');
    if (!element) {
      console.error('Élément de QR code non trouvé');
      return;
    }

    // Créer une capture d'écran du QR code
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Meilleure qualité
    });

    // Convertir le canvas en URL de données
    const dataUrl = canvas.toDataURL('image/png');

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qrcode-${props.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erreur lors du téléchargement du QR code:', error);
  }
};
</script>

<style scoped>
.barcode-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
}

.barcode-instructions {
  margin-top: 20px;
  text-align: center;
  color: #606266;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}
</style>