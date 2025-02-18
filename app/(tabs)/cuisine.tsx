import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import CookingModeScreen from '../components/CookingModeScreen';

export default function CuisineScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <CookingModeScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  }
});