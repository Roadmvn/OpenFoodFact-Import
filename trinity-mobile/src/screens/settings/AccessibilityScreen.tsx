// src/screens/settings/AccessibilityScreen.tsx
import React from 'react';
import { View, StyleSheet, SafeAreaView, Switch, Platform, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Appbar, Divider, List, IconButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';

const AccessibilityScreen = () => {
  const navigation = useNavigation();
  const { colorBlindMode, toggleColorblindMode, theme, setColorblindMode } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar backgroundColor={theme.headerBackground} barStyle="light-content" />
      
      {/* En-tête avec bouton de retour */}
      <LinearGradient
        colors={[theme.primary, theme.primary]}
        style={styles.headerContainer}
      >
        <TouchableOpacity 
          style={styles.backButtonContainer}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Retour"
          accessibilityHint="Retourner à l'écran précédent"
        >
          <View style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.headerText }]}>Paramètres d'accessibilité</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <Animatable.View 
          animation="fadeIn" 
          duration={800} 
          style={styles.content}
        >
          <Animatable.View 
            animation="fadeInUp" 
            duration={600} 
            delay={200}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <LinearGradient
              colors={theme.cardGradient}
              style={styles.cardHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <IconButton 
                icon="eye" 
                color="#FFFFFF" 
                size={24}
                accessibilityLabel="Icône de visibilité"
              />
              <Text style={styles.cardHeaderText}>Options visuelles</Text>
            </LinearGradient>
            
            <View style={styles.optionContainer}>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionText, { color: theme.text }]}>Mode daltonien</Text>
                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                  Adapte les couleurs pour les personnes ayant des difficultés à percevoir certaines couleurs
                </Text>
              </View>
              <Switch
                value={colorBlindMode}
                onValueChange={toggleColorblindMode}
                trackColor={theme.switchTrackColor}
                thumbColor={colorBlindMode ? theme.switchThumbColor.true : theme.switchThumbColor.false}
                ios_backgroundColor={theme.switchIOS_BG}
                accessibilityLabel="Activer le mode daltonien"
                accessibilityHint="Double-tapez pour activer ou désactiver le mode daltonien"
              />
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.colorSampleContainer}>
              <Text style={[styles.sampleTitle, { color: theme.text }]}>Aperçu des couleurs</Text>
              <View style={styles.colorSamples}>
                <View style={[styles.colorSample, { backgroundColor: theme.primary }]}>
                  <Text style={styles.colorSampleText}>Primaire</Text>
                </View>
                <View style={[styles.colorSample, { backgroundColor: theme.secondary }]}>
                  <Text style={styles.colorSampleText}>Secondaire</Text>
                </View>
                <View style={[styles.colorSample, { backgroundColor: theme.accent }]}>
                  <Text style={styles.colorSampleText}>Accent</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.resetContainer}>
              <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                Si vous rencontrez des problèmes avec le mode daltonien, vous pouvez réinitialiser les préférences
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // Réinitialiser le mode daltonien à false
                  setColorblindMode(false);
                  // Afficher un message de confirmation
                  alert("Préférences d'accessibilité réinitialisées");
                }}
                accessibilityLabel="Réinitialiser les préférences"
                accessibilityHint="Réinitialise les paramètres d'accessibilité"
              >
                <LinearGradient
                  colors={theme.buttonGradient}
                  style={styles.resetButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.resetButtonText}>Réinitialiser</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeInUp" 
            duration={600} 
            delay={400}
            style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Text style={[styles.infoTitle, { color: theme.text }]}>À propos de l'accessibilité</Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Trinity s'engage à rendre l'application accessible à tous les utilisateurs. Nous travaillons continuellement à améliorer l'expérience pour les personnes ayant des besoins d'accessibilité spécifiques.
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary, marginTop: 8 }]}>
              Si vous avez des suggestions pour améliorer l'accessibilité de notre application, n'hésitez pas à nous contacter.
            </Text>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButtonContainer: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardHeaderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    marginHorizontal: 16,
  },
  colorSampleContainer: {
    padding: 16,
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  colorSamples: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorSample: {
    width: '30%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSampleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resetContainer: {
    padding: 16,
    alignItems: 'center',
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    minWidth: 150,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AccessibilityScreen;