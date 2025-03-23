import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, TextInput, Alert, Platform, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const ScanScreen = () => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const navigation = useNavigation();
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const { theme, isColorblindMode } = useTheme();

  // Log pour déboguer le thème
  useEffect(() => {
    console.log('ScanScreen - Mode daltonien actif:', isColorblindMode);
    console.log('ScanScreen - Couleur primaire actuelle:', theme.primary);
    console.log('ScanScreen - Couleur d\'accent actuelle:', theme.accent);
  }, [isColorblindMode, theme]);

  const animateScan = () => {
    setScanning(true);
    Animated.sequence([
      Animated.timing(scanAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scanAnimation, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start(() => {
      setScanning(false);
    });
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    console.log(`Code-barres de type ${type} et données ${data} a été scanné!`);
    
    // Lancer l'animation
    animateScan();
    
    // Naviguer vers l'écran de détail après un court délai pour laisser l'animation se terminer
    setTimeout(() => {
      navigation.navigate('ProductDetail', { barcode: data });
    }, 1000);
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      handleBarCodeScanned({ type: 'manual', data: manualBarcode.trim() });
      setManualBarcode('');
    } else {
      Alert.alert('Erreur', 'Veuillez entrer un code-barres valide');
    }
  };

  // Mode simulation
  return (
    <SafeAreaView style={[styles.simulationContainer, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner (Simulation)</Text>
      </View>
      
      <View style={styles.simulationContent}>
        <Text style={[styles.simulationText, { color: theme.text }]}>
          Mode simulation activé. Veuillez entrer un code-barres manuellement.
        </Text>
        
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          value={manualBarcode}
          onChangeText={setManualBarcode}
          placeholder="Entrez un code-barres (ex: 3017620422003)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          maxLength={13}
        />
        
        <Button 
          mode="contained" 
          onPress={handleManualSubmit}
          style={[styles.button, { backgroundColor: theme.accent }]}
          color={theme.accent}
          loading={scanning}
          disabled={scanning}
        >
          Scanner
        </Button>
        
        {scanning && (
          <Animated.View 
            style={[
              styles.scanAnimation,
              {
                opacity: scanAnimation,
                transform: [
                  {
                    scale: scanAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2]
                    })
                  }
                ]
              }
            ]}
          >
            <Ionicons name="checkmark-circle" size={60} color={theme.accent} />
          </Animated.View>
        )}
        
        <View style={[styles.examplesContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.examplesTitle, { color: theme.text }]}>Exemples de codes-barres:</Text>
          <TouchableOpacity onPress={() => setManualBarcode('3017620422003')}>
            <Text style={[styles.exampleItem, { color: theme.secondary }]}>3017620422003 (Nutella)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setManualBarcode('3017620425035')}>
            <Text style={[styles.exampleItem, { color: theme.secondary }]}>3017620425035 (Nutella B-ready)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setManualBarcode('3046920022651')}>
            <Text style={[styles.exampleItem, { color: theme.secondary }]}>3046920022651 (Lindt Excellence)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  simulationContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
  simulationContent: {
    flex: 1,
    padding: 20,
  },
  simulationText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  button: {
    marginBottom: 30,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
  },
  scanAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examplesContainer: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exampleItem: {
    fontSize: 14,
    paddingVertical: 8,
  },
});