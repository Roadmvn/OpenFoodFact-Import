import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, TextInput, Alert, Platform, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const ScanScreen = () => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const navigation = useNavigation();
  const scanAnimation = useRef(new Animated.Value(0)).current;

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
    
    // Afficher l'alerte après un court délai pour laisser l'animation se terminer
    setTimeout(() => {
      Alert.alert('Code-barres scanné', `Code: ${data}`, [
        { text: 'OK', onPress: () => {} }
      ]);
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
    <SafeAreaView style={styles.simulationContainer}>
      <StatusBar style="light" />
      <View style={styles.header}>
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
        <Text style={styles.simulationText}>
          Mode simulation activé. Veuillez entrer un code-barres manuellement.
        </Text>
        
        <TextInput
          style={styles.input}
          value={manualBarcode}
          onChangeText={setManualBarcode}
          placeholder="Entrez un code-barres (ex: 3017620422003)"
          keyboardType="numeric"
          maxLength={13}
        />
        
        <Button 
          mode="contained" 
          onPress={handleManualSubmit}
          style={styles.button}
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
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
          </Animated.View>
        )}
        
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Exemples de codes-barres:</Text>
          <TouchableOpacity onPress={() => setManualBarcode('3017620422003')}>
            <Text style={styles.exampleItem}>3017620422003 (Nutella)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setManualBarcode('3017620425035')}>
            <Text style={styles.exampleItem}>3017620425035 (Nutella B-ready)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setManualBarcode('3046920022651')}>
            <Text style={styles.exampleItem}>3046920022651 (Lindt Excellence)</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2196F3',
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
    marginRight: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Pour équilibrer avec le bouton de retour
  },
  simulationContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  simulationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    marginVertical: 10,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
  },
  examplesContainer: {
    width: '100%',
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  exampleItem: {
    fontSize: 14,
    color: '#2196F3',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scanAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    zIndex: 100,
  },
});