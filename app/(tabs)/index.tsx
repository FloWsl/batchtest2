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
    cost: '45€',
    season: 'Printemps',
    diet: 'Végétarien',
    timeRange: '2-3h',
    equipmentLevel: 'Standard'
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
    cost: '50€',
    season: 'Été',
    diet: 'Végétarien',
    timeRange: '2-3h',
    equipmentLevel: 'Minimal'
  }
];

// Filter Chip Component
const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity 
    style={[styles.chip, active && styles.activeChip]} 
    onPress={onPress}
  >
    <Text style={[styles.chipText, active && styles.activeChipText]}>{label}</Text>
  </TouchableOpacity>
);

// Menu Filters Component
function MenuFilters({ 
  selectedSeason, 
  setSelectedSeason,
  selectedDiet,
  setSelectedDiet,
  selectedTime,
  setSelectedTime,
  selectedEquipment,
  setSelectedEquipment,
  isDark
}) {
  const seasons = ['Printemps', 'Été', 'Automne', 'Hiver'];
  const diets = ['Tous', 'Végétarien', 'Sans gluten', 'Low-carb'];
  const timeRanges = ['1-2h', '2-3h', '3h+'];
  const equipmentLevels = ['Minimal', 'Standard', 'Avancé'];

  return (
    <View style={styles.filtersContainer}>
      <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Saison</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {seasons.map(season => (
          <FilterChip 
            key={season}
            label={season}
            active={selectedSeason === season}
            onPress={() => setSelectedSeason(selectedSeason === season ? null : season)}
          />
        ))}
      </ScrollView>

      <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Régime alimentaire</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {diets.map(diet => (
          <FilterChip 
            key={diet}
            label={diet}
            active={selectedDiet === diet}
            onPress={() => setSelectedDiet(selectedDiet === diet ? null : diet)}
          />
        ))}
      </ScrollView>
      
      <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Temps de préparation</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {timeRanges.map(time => (
          <FilterChip 
            key={time}
            label={time}
            active={selectedTime === time}
            onPress={() => setSelectedTime(selectedTime === time ? null : time)}
          />
        ))}
      </ScrollView>
      
      <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Équipement</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {equipmentLevels.map(level => (
          <FilterChip 
            key={level}
            label={level}
            active={selectedEquipment === level}
            onPress={() => setSelectedEquipment(selectedEquipment === level ? null : level)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default function MenuScreen() {
  const [selectedMenu, setSelectedMenu] = useState<typeof weeklyMenus[0] | null>(null);
  const [userStatus] = useState('free'); // Add user status state
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { setActiveMenu, activeMenuId } = useStore();
  
  // Filter states
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

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
  
  // Filter menus based on selected filters
  const getFilteredMenus = () => {
    return weeklyMenus.filter(menu => {
      // If no filters are selected, show all menus
      if (!selectedSeason && !selectedDiet && !selectedTime && !selectedEquipment) {
        return true;
      }
      
      // Apply filters
      const seasonMatch = !selectedSeason || menu.season === selectedSeason;
      const dietMatch = !selectedDiet || selectedDiet === 'Tous' || menu.diet === selectedDiet;
      const timeMatch = !selectedTime || menu.timeRange === selectedTime;
      const equipmentMatch = !selectedEquipment || menu.equipmentLevel === selectedEquipment;
      
      return seasonMatch && dietMatch && timeMatch && equipmentMatch;
    });
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

  const filteredMenus = getFilteredMenus();

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.textLight]}>
            Menus de la semaine
          </Text>
        </View>

        {/* Menu Filters */}
        <MenuFilters
          selectedSeason={selectedSeason}
          setSelectedSeason={setSelectedSeason}
          selectedDiet={selectedDiet}
          setSelectedDiet={setSelectedDiet}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          selectedEquipment={selectedEquipment}
          setSelectedEquipment={setSelectedEquipment}
          isDark={isDark}
        />

        <View style={styles.menuGrid}>
          {filteredMenus.length > 0 ? (
            filteredMenus.map(menu => renderMenuCard(menu))
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color={isDark ? '#444' : '#DDD'} />
              <Text style={[styles.noResultsText, isDark && styles.textLight]}>
                Aucun menu ne correspond à vos critères
              </Text>
              <TouchableOpacity
                style={styles.resetFiltersButton}
                onPress={() => {
                  setSelectedSeason(null);
                  setSelectedDiet(null);
                  setSelectedTime(null);
                  setSelectedEquipment(null);
                }}
              >
                <Text style={styles.resetFiltersText}>Réinitialiser les filtres</Text>
              </TouchableOpacity>
            </View>
          )}
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
  
  // Filter styles
  filtersContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  chipRow: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeChip: {
    backgroundColor: '#FF6B6B',
  },
  chipText: {
    color: '#666666',
    fontWeight: '500',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  resetFiltersButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  resetFiltersText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Existing styles (keep these as they are)
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