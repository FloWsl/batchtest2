import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserPreferencesScreen from '../components/UserPreferencesScreen';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <UserPreferencesScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});