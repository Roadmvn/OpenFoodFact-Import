import { Camera } from 'react-native-vision-camera';
import { BarcodeFormat, Barcode } from '@react-native-ml-kit/barcode-scanning';
import { Platform } from 'react-native';

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
      const cameraPermission = await Camera.requestCameraPermission();
      const microphonePermission = await Camera.requestMicrophonePermission();
      return cameraPermission === 'granted' && microphonePermission === 'granted';
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

  /**
   * Vérifie si le mode torche est disponible sur l'appareil
   * @param device - Le device de caméra actuel (optionnel)
   * @returns boolean - true si le mode torche est disponible
   */
  static isTorchAvailable(device?: any): boolean {
    try {
      // Si un device de caméra est fourni, vérifier directement sa propriété hasFlash
      if (device && typeof device.hasFlash === 'boolean') {
        console.log('[BarcodeScannerService] Flash disponible sur le device:', device.hasFlash);
        return device.hasFlash;
      }

      // Vérification basée sur la plateforme (moins fiable, à utiliser seulement si aucun device n'est fourni)
      if (Platform.OS === 'android') {
        // Sur Android, certains émulateurs et appareils d'entrée de gamme n'ont pas de flash
        console.log('[BarcodeScannerService] Aucun device fourni, impossible de vérifier le flash avec précision');
        return false; // Par défaut, considérer que le flash n'est pas disponible sans vérification directe
      } else if (Platform.OS === 'ios') {
        // Sur iOS, la plupart des appareils ont un flash, mais pas les simulateurs
        // Utiliser une méthode plus sûre pour détecter les simulateurs iOS
        // sans dépendre des propriétés non typées de Platform.constants
        try {
          // @ts-ignore - Accès à une propriété qui pourrait ne pas exister dans les types
          const isSimulator = Platform.constants?.brand === 'Apple' && 
                             // @ts-ignore - Accès à une propriété qui pourrait ne pas exister dans les types
                             (Platform.constants?.model?.includes('Simulator') || false);
          console.log('[BarcodeScannerService] Probable simulateur iOS:', isSimulator);
          return !isSimulator;
        } catch {
          // En cas d'erreur, considérer qu'il s'agit d'un appareil réel
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[BarcodeScannerService] Erreur lors de la vérification du mode torche:', error);
      return false;
    }
  }
}
