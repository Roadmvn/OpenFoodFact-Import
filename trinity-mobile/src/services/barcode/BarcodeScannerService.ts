import { Camera } from 'react-native-vision-camera';
import { BarcodeFormat, Barcode } from '@react-native-ml-kit/barcode-scanning';

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
}
