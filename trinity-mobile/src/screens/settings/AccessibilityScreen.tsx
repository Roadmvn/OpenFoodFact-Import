// src/screens/settings/AccessibilityScreen.tsx
import React from 'react';
import { View, StyleSheet, SafeAreaView, Switch, Platform } from 'react-native';
import { Text, Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const AccessibilityScreen = () => {
  const navigation = useNavigation();
  const { isColorblindMode, toggleColorblindMode, theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Appbar.Header style={[styles.header, { backgroundColor: theme.primary }]}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="Accessibilité" titleStyle={{ color: '#FFFFFF' }} />
      </Appbar.Header>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Paramètres d'accessibilité</Text>
        
        <View style={[styles.optionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.optionText, { color: theme.text }]}>Mode daltonien</Text>
          <Switch
            value={isColorblindMode}
            onValueChange={toggleColorblindMode}
            trackColor={{ false: '#767577', true: theme.accent }}
            thumbColor={isColorblindMode ? theme.secondary : '#f4f3f4'}
          />
        </View>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Le mode daltonien adapte les couleurs de l'interface pour les personnes ayant des difficultés à percevoir certaines couleurs.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  optionText: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
  },
});

export default AccessibilityScreen;