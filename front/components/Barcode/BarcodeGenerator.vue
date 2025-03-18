<template>
  <div class="barcode-container" ref="barcodeContainer">
    <div v-if="!loaded" class="barcode-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Génération du QR code...</span>
    </div>
    <div v-else class="barcode-display">
      <img :src="qrCodeUrl" :alt="`QR Code`" class="qrcode-image" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import QRCode from 'qrcode';

const props = defineProps({
  value: {
    type: String,
    required: true,
    default: ''
  },
  width: {
    type: Number,
    default: 128
  },
  height: {
    type: Number,
    default: 128
  },
  colorDark: {
    type: String,
    default: '#000000'
  },
  colorLight: {
    type: String,
    default: '#ffffff'
  },
  margin: {
    type: Number,
    default: 4
  },
  errorCorrectionLevel: {
    type: String,
    default: 'M', // L, M, Q, H
  }
});

const barcodeContainer = ref(null);
const loaded = ref(false);
const qrCodeUrl = ref('');

// Fonction pour générer le QR code
const generateQRCode = async () => {
  if (!props.value) return;
  
  try {
    loaded.value = false;
    
    // Options pour le QR code
    const options = {
      width: props.width,
      margin: props.margin,
      color: {
        dark: props.colorDark,
        light: props.colorLight
      },
      errorCorrectionLevel: props.errorCorrectionLevel
    };
    
    // Générer le QR code directement en dataURL
    qrCodeUrl.value = await QRCode.toDataURL(props.value, options);
    loaded.value = true;
    
    console.log('QR Code généré avec succès:', qrCodeUrl.value.substring(0, 50) + '...');
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
  }
};

// Générer le QR code au montage du composant
onMounted(() => {
  console.log('Composant monté, génération du QR code pour:', props.value);
  generateQRCode();
});

// Surveiller les changements de valeur pour régénérer le QR code
watch(() => props.value, (newValue) => {
  console.log('Valeur du code changée, régénération du QR code:', newValue);
  generateQRCode();
});
</script>

<style scoped>
.barcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  width: 100%;
}

.barcode-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #909399;
}

.barcode-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.qrcode-image {
  max-width: 100%;
  height: auto;
  display: block;
}

.barcode-value {
  margin-top: 5px;
  font-size: 14px;
  color: #606266;
}
</style>