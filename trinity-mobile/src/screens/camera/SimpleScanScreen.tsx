import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  Vibration,
  Alert 
} from 'react-native';
import { CameraView, Camera, BarcodeScanningResult } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { ProductStorageService } from '../../services/products/ProductStorageService';

// Interface pour le résultat du scan de code-barres
interface BarcodeScanResult {
  type: string;
  data: string;
}

const SimpleScanScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  useEffect(() => {
    const getPermissions = async () => {
      try {
        console.log('Demande de permissions pour la caméra...');
        const { status } = await Camera.requestCameraPermissionsAsync();
        console.log('Statut de la permission de caméra:', status);
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Erreur lors de la demande de permission:', error);
        setHasPermission(false);
        Alert.alert(
          "Erreur d'accès à la caméra",
          "Nous n'avons pas pu accéder à la caméra. Veuillez vérifier vos paramètres de confidentialité."
        );
      }
    };

    console.log("Initialisation de la caméra SimpleScan");
    getPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanResult) => {
    if (scanned) return;
    
    console.log(`Code-barres scanné ! Type: ${type}, Données: ${data}`);
    setScanned(true);
    
    Vibration.vibrate(200);
    
    try {
      // Enregistrer le produit scanné
      await ProductStorageService.saveScannedProduct({
        id: data,
        name: `Produit ${data.substring(0, 6)}...`,
        date: Date.now()
      });
      
      console.log('Produit scanné enregistré avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du produit scanné:', error);
    }
    
    setTimeout(() => {
      navigation.navigate('ProductDetail', { barcode: data });
    }, 500);
  };

  const handleRescan = () => {
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, textAlign: 'center', margin: 20 }}>
          Demande d'accès à la caméra...
        </Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, textAlign: 'center', margin: 20 }}>
          Accès à la caméra refusé
        </Text>
        <TouchableOpacity 
          style={{ 
            alignSelf: 'center', 
            padding: 15, 
            backgroundColor: theme.accent, 
            borderRadius: 8 
          }} 
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner Simple</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "code128", "code39", "qr"],
          }}
        />

        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>

        {scanned && (
          <View style={styles.rescanButtonContainer}>
            <TouchableOpacity 
              style={[styles.rescanButton, { backgroundColor: theme.accent }]} 
              onPress={handleRescan}
            >
              <Text style={styles.rescanButtonText}>Scanner à nouveau</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SimpleScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 12,
  },
  rescanButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  rescanButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  rescanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 