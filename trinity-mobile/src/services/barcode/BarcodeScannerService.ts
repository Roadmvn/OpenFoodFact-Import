import { Camera } from 'react-native-vision-camera';
import { BarcodeFormat, Barcode } from '@react-native-ml-kit/barcode-scanning';
import { Platform, Vibration } from 'react-native';

export interface BarcodeScanResult {
  value: string;
  format: string;
  timestamp: number;
}

export class BarcodeScannerService {
  /**
   * Vérifie et demande les permissions de caméra si nécessaire
   * @returns Promise<boolean> - true si la permission est accordée, false sinon
   */
  static async checkCameraPermission(): Promise<boolean> {
    try {
      // Vérifier d'abord si les permissions sont déjà accordées
      const cameraStatus = await Camera.getCameraPermissionStatus();
      console.log('[BarcodeScannerService] Statut initial des permissions de caméra:', cameraStatus);
      
      if (cameraStatus === 'granted') {
        console.log('[BarcodeScannerService] Permissions de caméra déjà accordées');
        return true;
      }
      
      // Si les permissions ne sont pas accordées, les demander
      console.log('[BarcodeScannerService] Demande de permissions de caméra...');
      const newCameraStatus = await Camera.requestCameraPermission();
      console.log('[BarcodeScannerService] Nouveau statut des permissions de caméra:', newCameraStatus);
      
      // Vérifier également les permissions de microphone sur iOS
      let microphoneStatus = true;
      if (Platform.OS === 'ios') {
        const micStatus = await Camera.getMicrophonePermissionStatus();
        console.log('[BarcodeScannerService] Statut initial des permissions de microphone:', micStatus);
        
        if (micStatus !== 'granted') {
          const newMicStatus = await Camera.requestMicrophonePermission();
          console.log('[BarcodeScannerService] Nouveau statut des permissions de microphone:', newMicStatus);
          microphoneStatus = newMicStatus === 'granted';
        }
      }
      
      const hasPermission = newCameraStatus === 'granted' && microphoneStatus;
      console.log('[BarcodeScannerService] Résultat final des permissions:', hasPermission);
      return hasPermission;
    } catch (error) {
      console.error('[BarcodeScannerService] Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  /**
   * Traite le résultat du scan de code-barres
   * @param barcode - L'objet Barcode de ML Kit
   * @returns BarcodeScanResult - Le résultat du scan
   */
  static processMLKitBarcode(barcode: Barcode): BarcodeScanResult {
    return {
      value: barcode.value || '',
      format: this.getFormatName(barcode.format),
      timestamp: Date.now()
    };
  }

  /**
   * Traite le résultat du scan de code-barres
   * @param value - La valeur du code-barres
   * @param format - Le format du code-barres
   * @returns BarcodeScanResult - Le résultat du scan
   */
  static processBarcodeScanResult(value: string, format: string): BarcodeScanResult {
    return {
      value,
      format,
      timestamp: Date.now()
    };
  }

  /**
   * Obtient le nom lisible du format de code-barres
   * @param format - Le format de code-barres de ML Kit
   * @returns string - Le nom du format
   */
  static getFormatName(format: BarcodeFormat): string {
    switch (format) {
      case BarcodeFormat.EAN_13:
        return 'EAN-13';
      case BarcodeFormat.EAN_8:
        return 'EAN-8';
      case BarcodeFormat.QR_CODE:
        return 'QR Code';
      case BarcodeFormat.UPC_A:
        return 'UPC-A';
      case BarcodeFormat.UPC_E:
        return 'UPC-E';
      case BarcodeFormat.CODE_39:
        return 'Code 39';
      case BarcodeFormat.CODE_128:
        return 'Code 128';
      default:
        return 'Inconnu';
    }
  }

  /**
   * Vérifie si le mode torche est disponible sur l'appareil
   * @param device L'objet device de la caméra
   * @returns boolean - true si le mode torche est disponible
   */
  static isTorchAvailable(device: any): boolean {
    if (!device) return false;
    
    if (Platform.OS === 'ios') {
      // Sur iOS, on vérifie la propriété hasTorch
      return device.hasTorch || false;
    } else {
      // Sur Android, on vérifie la propriété hasFlash
      return device.hasFlash || false;
    }
  }

  /**
   * Fournit les paramètres optimaux de caméra en fonction de la plateforme
   * @returns Object - Paramètres optimisés pour la caméra
   */
  static getOptimalCameraSettings(): any {
    const commonSettings = {
      fps: 30,
      hdr: false,
      lowLightBoost: false,
    };

    if (Platform.OS === 'ios') {
      return {
        ...commonSettings,
        enableDepthData: false,
        enablePortraitEffectsMatteDelivery: false,
        // Paramètres spécifiques à iOS
        preset: 'medium', // 'photo', 'medium', 'low'
      };
    } else {
      return {
        ...commonSettings,
        // Paramètres spécifiques à Android
        videoStabilizationMode: 'off',
        isAudioEnabled: false,
      };
    }
  }

  /**
   * Déclenche un retour haptique adapté à la plateforme lors de la détection d'un code-barres
   */
  static triggerHapticFeedback(): void {
    if (Platform.OS === 'ios') {
      // Sur iOS, une vibration courte est suffisante
      Vibration.vibrate(100);
    } else {
      // Sur Android, on peut utiliser un pattern de vibration
      Vibration.vibrate([0, 50, 50, 50]);
    }
  }

  /**
   * Formate l'URI de la photo pour l'analyse selon la plateforme
   * @param path Chemin de la photo
   * @returns string - URI formaté pour l'analyse
   */
  static formatPhotoUri(path: string): string {
    if (!path) return '';
    
    if (Platform.OS === 'android') {
      return path.startsWith('file://') ? path : `file://${path}`;
    } else {
      // Sur iOS, le chemin est déjà un URI complet
      return path;
    }
  }

  /**
   * Calcule la qualité d'image optimale en fonction de l'appareil
   * @returns number - La qualité d'image (0-100)
   */
  static getOptimalImageQuality(): number {
    // Sur les appareils moins puissants, réduire la qualité pour améliorer les performances
    if (Platform.OS === 'android') {
      try {
        // Vérifier si l'appareil est un appareil haut de gamme
        // Cette vérification est simplifiée, en production on utiliserait une méthode plus robuste
        const brand = Platform.constants?.Brand?.toLowerCase() || '';
        const isHighEndDevice = brand.includes('samsung') || 
                               brand.includes('google') || 
                               brand.includes('oneplus');
        
        console.log('[BarcodeScannerService] Marque de l\'appareil:', brand);
        console.log('[BarcodeScannerService] Appareil haut de gamme:', isHighEndDevice);
        
        return isHighEndDevice ? 80 : 60;
      } catch (error) {
        console.error('[BarcodeScannerService] Erreur lors de la détection de l\'appareil:', error);
        return 70; // Valeur par défaut en cas d'erreur
      }
    }
    
    // Pour iOS, utiliser une qualité plus élevée par défaut
    return 85;
  }
}
