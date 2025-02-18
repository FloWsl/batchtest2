import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useStore } from '../../store';

const { width } = Dimensions.get('window');

// Sample data structure for development
const weeklyMenus = [
  {
    id: 'week-12',
    title: 'Menu de la semaine 12',
    subtitle: 'Cuisine méditerranéenne',
    image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&auto=format&fit=crop&q=80',
    recipes: [
      { name: 'Épinards à la crème et gnocchi', time: '30 min', portions: 4 },
      { name: 'Tofu à la moutarde et riz', time: '25 min', portions: 4 },
      { name: 'Grilled cheese et salade', time: '15 min', portions: 4 },
      { name: 'Patates douces rôties', time: '45 min', portions: 4 },
      { name: 'Velouté carotte et coco', time: '35 min', portions: 4 }
    ],
    ingredients: [
      { name: 'Épinards', quantity: '500g' },
      { name: 'Gnocchi', quantity: '400g' },
      { name: 'Tofu ferme', quantity: '400g' },
      { name: 'Riz', quantity: '300g' },
      { name: 'Patates douces', quantity: '800g' }
    ],
    isPremium: false,
    isNew: true,
    estimatedTime: '2h30',
    cost: '45€'
  },
  {
    id: 'week-13',
    title: 'Menu de la semaine 13',
    subtitle: 'Cuisine asiatique',
    image: 'https://images.unsplash.com/photo-1512003867696-6d5ce6835040?w=800&auto=format&fit=crop&q=80',
    recipes: [
      { name: 'Ramen aux légumes', time: '40 min', portions: 4 },
      { name: 'Curry de légumes', time: '35 min', portions: 4 },
      { name: 'Pad thai au tofu', time: '30 min', portions: 4 },
      { name: 'Bol de riz aux œufs', time: '20 min', portions: 4 },
      { name: 'Soupe miso', time: '15 min', portions: 4 }
    ],
    ingredients: [
      { name: 'Nouilles ramen', quantity: '400g' },
      { name: 'Tofu', quantity: '400g' },
      { name: 'Légumes variés', quantity: '1kg' },
      { name: 'Sauce soja', quantity: '200ml' },
      { name: 'Pâte miso', quantity: '100g' }
    ],
    isPremium: true,
    isNew: false,
    estimatedTime: '2h15',
    cost: '50€'
  }
];

export default function MenuScreen() {
  const [selectedMenu, setSelectedMenu] = useState<typeof weeklyMenus[0] | null>(null);
  const [userStatus] = useState('free'); // Add user status state
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { setActiveMenu, activeMenuId } = useStore();

  const openMenuDetail = (menu: typeof weeklyMenus[0]) => {
    if (menu.isPremium && userStatus !== 'premium') {
      // Handle premium content (you can implement premium modal here)
      return;
    }
    setSelectedMenu(menu);
  };

  const handleSelectMenu = (menu: typeof weeklyMenus[0]) => {
    setActiveMenu(menu.id);
    setSelectedMenu(null);
  };

  const renderMenuCard = (menu: typeof weeklyMenus[0]) => (
    <TouchableOpacity
      key={menu.id}
      style={[styles.menuCard, isDark && styles.menuCardDark]}
      onPress={() => openMenuDetail(menu)}>
      <View style={styles.menuImageContainer}>
        <Image source={{ uri: menu.image }} style={styles.menuImage} />
        <View style={styles.badgeContainer}>
          {menu.isNew && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Nouveau</Text>
            </View>
          )}
          {menu.isPremium && (
            <View style={[styles.badge, styles.premiumBadge]}>
              <Text style={styles.badgeText}>Premium</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.menuContent}>
        <View style={styles.menuHeader}>
          <View>
            <Text style={[styles.menuTitle, isDark && styles.textLight]}>
              {menu.title}
            </Text>
            <Text style={[styles.menuSubtitle, isDark && styles.textLightSecondary]}>
              {menu.subtitle}
            </Text>
          </View>
          <View style={styles.menuMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={isDark ? '#FFFFFF' : '#666666'} />
              <Text style={[styles.metaText, isDark && styles.textLightSecondary]}>
                {menu.estimatedTime}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={16} color={isDark ? '#FFFFFF' : '#666666'} />
              <Text style={[styles.metaText, isDark && styles.textLightSecondary]}>
                {menu.cost}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.textLight]}>
            Menus de la semaine
          </Text>
        </View>

        <View style={styles.menuGrid}>
          {weeklyMenus.map(menu => renderMenuCard(menu))}
        </View>
      </ScrollView>

      {/* Menu Detail Modal */}
      <Modal
        visible={selectedMenu !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedMenu(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedMenu(null)}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>

            {selectedMenu && (
              <ScrollView style={styles.modalScroll}>
                <Image
                  source={{ uri: selectedMenu.image }}
                  style={styles.modalImage}
                />
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, isDark && styles.textLight]}>
                    {selectedMenu.title}
                  </Text>
                  <Text style={[styles.modalSubtitle, isDark && styles.textLightSecondary]}>
                    {selectedMenu.subtitle}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
                    Recettes incluses
                  </Text>
                  {selectedMenu.recipes.map((recipe, index) => (
                    <View key={index} style={styles.recipeItem}>
                      <Text style={[styles.recipeName, isDark && styles.textLight]}>
                        {recipe.name}
                      </Text>
                      <View style={styles.recipeDetails}>
                        <Text style={[styles.recipeTime, isDark && styles.textLightSecondary]}>
                          {recipe.time}
                        </Text>
                        <Text style={[styles.recipePortions, isDark && styles.textLightSecondary]}>
                          {recipe.portions} pers.
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
                    Liste de courses
                  </Text>
                  {selectedMenu.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <Text style={[styles.ingredientName, isDark && styles.textLight]}>
                        {ingredient.name}
                      </Text>
                      <Text style={[styles.ingredientQuantity, isDark && styles.textLightSecondary]}>
                        {ingredient.quantity}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    activeMenuId === selectedMenu.id && styles.selectedButton
                  ]}
                  onPress={() => handleSelectMenu(selectedMenu)}>
                  <Text style={styles.selectButtonText}>
                    {activeMenuId === selectedMenu.id ? 'Menu actif' : 'Sélectionner ce menu'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  menuGrid: {
    padding: 20,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  menuCardDark: {
    backgroundColor: '#1A1A1A',
  },
  menuImageContainer: {
    height: 150,
    position: 'relative',
  },
  menuImage: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  menuContent: {
    padding: 15,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  menuMeta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#666666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalContentDark: {
    backgroundColor: '#1A1A1A',
  },
  modalScroll: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  modalHeader: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  recipeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipeName: {
    fontSize: 16,
    flex: 1,
  },
  recipeDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  recipeTime: {
    fontSize: 14,
    color: '#666666',
  },
  recipePortions: {
    fontSize: 14,
    color: '#666666',
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientName: {
    fontSize: 16,
  },
  ingredientQuantity: {
    fontSize: 14,
    color: '#666666',
  },
  selectButton: {
    backgroundColor: '#FF6B6B',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});