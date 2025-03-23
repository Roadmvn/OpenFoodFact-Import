import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  Vibration,
  Platform,
  Dimensions
} from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const FRAME_WIDTH = width * 0.7;
const FRAME_HEIGHT = FRAME_WIDTH;

const ExpoCameraScanScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
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

    console.log("Initialisation de la caméra");
    getPermissions();
  }, []);

  const handleBarCodeScanned = (scanResult: BarCodeScannerResult) => {
    if (scanned) return;
    
    const { type, data } = scanResult;
    console.log(`Type de code: ${type}, Données: ${data}`);
    setScanned(true);
    
    Vibration.vibrate(200);

    setTimeout(() => {
      navigation.navigate('ProductDetail', { barcode: data });
    }, 500);
  };

  const handleRescan = () => {
    setScanned(false);
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.torch
        : Camera.Constants.FlashMode.off
    );
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.text, { color: theme.text }]}>Demande d'accès à la caméra...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.text, { color: theme.text }]}>Accès à la caméra refusé</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.accent }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Retour</Text>
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
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner (Camera)</Text>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFillObject}
          flashMode={flashMode}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: [
              BarCodeScanner.Constants.BarCodeType.ean13,
              BarCodeScanner.Constants.BarCodeType.ean8,
              BarCodeScanner.Constants.BarCodeType.code128,
              BarCodeScanner.Constants.BarCodeType.code39,
              BarCodeScanner.Constants.BarCodeType.qr
            ],
          }}
        />

        <View style={styles.overlay}>
          <View style={styles.unfocusedArea} />
          <View style={styles.middleRow}>
            <View style={styles.unfocusedArea} />
            <View style={styles.focusedArea}>
              <View style={styles.scanFrame} />
            </View>
            <View style={styles.unfocusedArea} />
          </View>
          <View style={styles.unfocusedArea} />
        </View>

        <TouchableOpacity 
          style={[
            styles.flashButton, 
            { backgroundColor: flashMode === Camera.Constants.FlashMode.torch ? theme.accent : 'rgba(0,0,0,0.6)' }
          ]} 
          onPress={toggleFlash}
        >
          <MaterialCommunityIcons 
            name={flashMode === Camera.Constants.FlashMode.torch ? "flashlight" : "flashlight-off"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Placez un code-barres dans le cadre
          </Text>
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

export default ExpoCameraScanScreen;

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
    paddingTop: Platform.OS === 'android' ? 40 : 15,
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
  text: {
    fontSize: 16,
    margin: 20,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    flex: 1,
    flexDirection: 'column',
  },
  unfocusedArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: FRAME_HEIGHT,
  },
  focusedArea: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 12,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  flashButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
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