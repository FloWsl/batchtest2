import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useStore } from '../../store';

const equipment = [
  {
    id: '1',
    name: 'Ustensiles essentiels',
    items: [
      { name: 'Couteau de chef', description: 'Pour découper et émincer', image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&auto=format&fit=crop&q=80' },
      { name: 'Planche à découper', description: 'Surface de travail hygiénique', image: 'https://images.unsplash.com/photo-1590794056432-771c5c8aeb8d?w=800&auto=format&fit=crop&q=80' },
    ]
  },
  {
    id: '2',
    name: 'Équipement de cuisson',
    items: [
      { name: 'Poêle antiadhésive', description: 'Pour la cuisson à feu vif', image: 'https://images.unsplash.com/photo-1593618997771-f0df5895bc89?w=800&auto=format&fit=crop&q=80' },
      { name: 'Casserole', description: 'Pour les sauces et les cuissons à l\'eau', image: 'https://images.unsplash.com/photo-1593618998061-e2093b5a05b8?w=800&auto=format&fit=crop&q=80' },
    ]
  }
];

const recipes = [
  {
    id: '1',
    name: 'Techniques de base',
    items: [
      { name: 'Émincé d\'oignons', time: '5 min', difficulty: 'Facile', image: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=800&auto=format&fit=crop&q=80' },
      { name: 'Cuisson du riz', time: '20 min', difficulty: 'Facile', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop&q=80' },
    ]
  },
  {
    id: '2',
    name: 'Sauces de base',
    items: [
      { name: 'Sauce tomate maison', time: '30 min', difficulty: 'Moyen', image: 'https://images.unsplash.com/photo-1608219994488-c8c41c34a31e?w=800&auto=format&fit=crop&q=80' },
      { name: 'Vinaigrette classique', time: '5 min', difficulty: 'Facile', image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=800&auto=format&fit=crop&q=80' },
    ]
  }
];

export default function CuisineScreen() {
  const [activeTab, setActiveTab] = useState('recipes');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { activeMenuId } = useStore();

  const renderRecipeCard = (item: any) => (
    <View style={[styles.card, isDark && styles.cardDark]} key={item.name}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, isDark && styles.textLight]}>{item.name}</Text>
        <View style={styles.cardMeta}>
          {item.time && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={isDark ? '#FFFFFF' : '#666666'} />
              <Text style={[styles.metaText, isDark && styles.textLightSecondary]}>{item.time}</Text>
            </View>
          )}
          {item.difficulty && (
            <View style={styles.metaItem}>
              <Ionicons name="stats-chart-outline" size={16} color={isDark ? '#FFFFFF' : '#666666'} />
              <Text style={[styles.metaText, isDark && styles.textLightSecondary]}>{item.difficulty}</Text>
            </View>
          )}
          {item.description && (
            <Text style={[styles.description, isDark && styles.textLightSecondary]}>{item.description}</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textLight]}>Cuisine</Text>
        <View style={[styles.tabs, isDark && styles.tabsDark]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'recipes' && styles.activeTab,
              isDark && activeTab === 'recipes' && styles.activeTabDark,
            ]}
            onPress={() => setActiveTab('recipes')}>
            <Ionicons
              name="book-outline"
              size={20}
              color={activeTab === 'recipes' ? '#FF6B6B' : isDark ? '#FFFFFF' : '#000000'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'recipes' && styles.activeTabText,
                isDark && styles.textLight,
              ]}>
              Recettes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'equipment' && styles.activeTab,
              isDark && activeTab === 'equipment' && styles.activeTabDark,
            ]}
            onPress={() => setActiveTab('equipment')}>
            <Ionicons
              name="construct-outline"
              size={20}
              color={activeTab === 'equipment' ? '#FF6B6B' : isDark ? '#FFFFFF' : '#000000'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'equipment' && styles.activeTabText,
                isDark && styles.textLight,
              ]}>
              Équipement
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'recipes' ? (
          recipes.map(section => (
            <View key={section.id} style={styles.section}>
              <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
                {section.name}
              </Text>
              <View style={styles.cardGrid}>
                {section.items.map(item => renderRecipeCard(item))}
              </View>
            </View>
          ))
        ) : (
          equipment.map(section => (
            <View key={section.id} style={styles.section}>
              <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
                {section.name}
              </Text>
              <View style={styles.cardGrid}>
                {section.items.map(item => renderRecipeCard(item))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  textLight: {
    color: '#FFFFFF',
  },
  textLightSecondary: {
    color: '#CCCCCC',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  tabsDark: {
    backgroundColor: '#1A1A1A',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFF5F5',
  },
  activeTabDark: {
    backgroundColor: '#2A2A2A',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  cardGrid: {
    gap: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardDark: {
    backgroundColor: '#1A1A1A',
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#666666',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});