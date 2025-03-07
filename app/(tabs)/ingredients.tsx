import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShoppingListScreen from '../components/ShoppingListScreen';

export default function IngredientsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ShoppingListScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});