import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Vibration, 
  Alert, 
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { BarcodeScannerService } from '../../services/barcode/BarcodeScannerService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../context/ThemeContext';
import { scanBarcodes, BarcodeFormat } from '@react-native-ml-kit/barcode-scanning';

// Définition du type pour la navigation
type RootStackParamList = {
  ProductDetail: { barcode: string };
};

// Type pour les résultats de code-barres
interface BarcodeResult {
  value: string;
  format: string;
}

export default function NativeScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.back;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [deviceInitialized, setDeviceInitialized] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  console.log('[NativeScanScreen] Composant monté');

  // Vérification des permissions de caméra
  useEffect(() => {
    console.log('[NativeScanScreen] Vérification des permissions de caméra...');
    const checkPermission = async () => {
      try {
        const cameraPermission = await BarcodeScannerService.checkCameraPermission();
        console.log('[NativeScanScreen] Statut des permissions de caméra:', cameraPermission);
        setHasPermission(cameraPermission);
      } catch (error) {
        console.error('[NativeScanScreen] Erreur lors de la vérification des permissions:', error);
        setHasPermission(false);
      }
    };

    checkPermission();
  }, []);

  // Vérification de l'initialisation du device de caméra
  useEffect(() => {
    if (device) {
      console.log('[NativeScanScreen] Device de caméra disponible:', device.id);
      setDeviceInitialized(true);
    } else {
      console.log('[NativeScanScreen] Device de caméra non disponible');
    }
  }, [device]);

  // Fonction pour traiter le code-barres scanné
  const onBarcodeDetected = useCallback((barcode: BarcodeResult) => {
    console.log('[NativeScanScreen] Traitement du code-barres détecté:', barcode.value);
    
    if (!scanned && !processing) {
      handleBarCodeScanned(barcode);
    }
  }, [scanned, processing]);

  // Fonction pour capturer une photo et analyser les codes-barres
  const captureAndAnalyze = useCallback(async () => {
    console.log('[NativeScanScreen] Début de la capture d\'image...');
    
    if (scanned || processing || !camera.current) {
      console.log('[NativeScanScreen] Impossible de capturer: scanned=', scanned, 'processing=', processing, 'camera=', !!camera.current);
      return;
    }
    
    try {
      setProcessing(true);
      
      // Capturer une photo
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
      });
      
      console.log('[NativeScanScreen] Photo capturée:', photo.path);
      
      // S'assurer que photo.path est une chaîne de caractères
      const photoPath = typeof photo.path === 'string' ? photo.path : String(photo.path);
      const photoUri = Platform.OS === 'android' ? `file://${photoPath}` : photoPath;

      // En mode développement, simuler la détection d'un code-barres après un court délai
      if (__DEV__ && Platform.OS === 'android') {
        console.log('[NativeScanScreen] Mode développement: simulation de détection de code-barres');
        setCapturedImage(photoUri);
        
        // Simuler un délai d'analyse
        setTimeout(() => {
          const simulatedBarcode: BarcodeResult = {
            value: '3017620422003', // Code-barres Nutella pour test
            format: 'EAN_13'
          };
          console.log('[NativeScanScreen] Code-barres simulé:', simulatedBarcode);
          onBarcodeDetected(simulatedBarcode);
        }, 1500);
        return;
      }

      // Analyser l'image pour détecter les codes-barres
      console.log('[NativeScanScreen] Analyse de l\'image pour les codes-barres...');
      const barcodes = await scanBarcodes(photoUri, {
        formats: [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.QR_CODE,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
        ]
      });

      console.log('[NativeScanScreen] Résultat de l\'analyse:', barcodes);

      if (barcodes.length > 0) {
        setCapturedImage(photoUri);
        
        const barcodeResult: BarcodeResult = {
          value: barcodes[0].value || '',
          format: barcodes[0].format.toString()
        };
        
        onBarcodeDetected(barcodeResult);
      } else {
        console.log('[NativeScanScreen] Aucun code-barres détecté');
        setProcessing(false);
        Alert.alert(
          'Aucun code-barres détecté',
          'Veuillez réessayer avec un code-barres plus visible.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      console.error('[NativeScanScreen] Erreur lors de la capture ou de l\'analyse:', error);
      setProcessing(false);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la capture ou de l\'analyse de l\'image. Veuillez réessayer.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  }, [scanned, processing, camera, onBarcodeDetected]);

  // Démarrer l'analyse automatique lorsque la caméra est prête
  useEffect(() => {
    console.log('[NativeScanScreen] Démarrage de l\'analyse automatique...');
    console.log('[NativeScanScreen] État: deviceInitialized=', deviceInitialized, 'hasPermission=', hasPermission, 'scanned=', scanned, 'processing=', processing);
    
    if (deviceInitialized && hasPermission && !scanned && !processing) {
      // Attendre que la caméra soit initialisée
      const timer = setTimeout(() => {
        captureAndAnalyze();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deviceInitialized, hasPermission, scanned, processing, captureAndAnalyze]);

  const handleBarCodeScanned = useCallback(
    async (barcode: BarcodeResult) => {
      console.log('[NativeScanScreen] Traitement du code-barres détecté:', barcode.value);
      
      if (scanned || processing) return;
      
      setScanned(true);
      setProcessing(false);
      
      // Vibrer pour indiquer la détection
      Vibration.vibrate(200);
      
      try {
        const text = barcode.value;
        
        // Naviguer vers l'écran de détails du produit avec le code-barres scanné
        navigation.navigate('ProductDetail', { barcode: text });
      } catch (error) {
        console.error('[NativeScanScreen] Erreur lors de la navigation:', error);
        Alert.alert(
          'Erreur',
          'Une erreur est survenue lors du traitement du code-barres.',
          [{ text: 'OK', onPress: handleRescan }]
        );
      }
    },
    [navigation, scanned, processing]
  );

  const handleRescan = () => {
    console.log('[NativeScanScreen] Nouveau scan déclenché');
    
    setScanned(false);
    setProcessing(false);
    setCapturedImage(null);
    setCameraError(null);
  };

  if (hasPermission === null) {
    console.log('[NativeScanScreen] Vérification des permissions en cours...');
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={[styles.text, { color: theme.text }]}>Demande d'autorisation de la caméra...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    console.log('[NativeScanScreen] Permissions de caméra non accordées');
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.text, { color: theme.text }]}>Pas d'accès à la caméra</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {scanned && capturedImage ? (
        // Afficher l'image capturée avec le code-barres
        <>
          <Image
            source={{ uri: capturedImage }}
            style={styles.capturedImage}
            resizeMode="contain"
          />
          <View style={styles.overlay}>
            <View style={styles.scanAreaSuccess} />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.accent }]}
              onPress={handleRescan}
            >
              <Text style={styles.buttonText}>Scanner un autre code</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : deviceInitialized ? (
        // Afficher la caméra
        <>
          <Camera
            ref={camera}
            style={styles.camera}
            device={device}
            isActive={!scanned && !processing}
            photo={true}
            onError={(error) => {
              console.error('[NativeScanScreen] Erreur de caméra:', error);
              setCameraError(`Erreur de caméra: ${error.message}`);
            }}
          />
          
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
          </View>
          
          {processing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.processingText}>Analyse en cours...</Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.accent },
                (processing || scanned) && styles.buttonDisabled,
              ]}
              onPress={() => {
                if (!processing && !scanned) {
                  captureAndAnalyze();
                }
              }}
              disabled={processing || scanned}
            >
              <Text style={styles.buttonText}>
                {processing ? 'Analyse en cours...' : 'Scanner'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.instructionText}>
            Placez le code-barres dans le cadre
          </Text>
        </>
      ) : (
        // Afficher l'écran de chargement
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={[styles.text, { color: theme.text }]}>Chargement de la caméra...</Text>
          {cameraError && (
            <Text style={[styles.errorText, { color: theme.error }]}>{cameraError}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    padding: 20,
    color: 'red',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
  },
  scanAreaSuccess: {
    width: 250,
    height: 250,
    borderWidth: 4,
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  processingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  processingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  instructionText: {
    position: 'absolute',
    top: 50,
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
});
