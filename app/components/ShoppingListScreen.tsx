import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SectionList,
  Alert,
  Share,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useStore } from '../../store';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Category order and icons for grouping ingredients
const CATEGORY_CONFIG = {
  'produce': {
    icon: 'leaf-outline',
    order: 1,
    label: 'Fruits & Légumes'
  },
  'dairy': {
    icon: 'wine-outline',
    order: 2,
    label: 'Produits Laitiers'
  },
  'meat': {
    icon: 'restaurant-outline',
    order: 3,
    label: 'Viandes & Poissons'
  },
  'bakery': {
    icon: 'pizza-outline',
    order: 4,
    label: 'Boulangerie'
  },
  'pantry': {
    icon: 'archive-outline',
    order: 5,
    label: 'Garde-manger'
  },
  'frozen': {
    icon: 'snow-outline',
    order: 6,
    label: 'Surgelés'
  },
  'spices': {
    icon: 'flask-outline',
    order: 7,
    label: 'Épices & Condiments'
  },
  'beverages': {
    icon: 'beer-outline',
    order: 8,
    label: 'Boissons'
  },
  'other': {
    icon: 'basket-outline',
    order: 9,
    label: 'Autres'
  }
};

export default function ShoppingListScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { 
    shoppingList, 
    toggleShoppingItem, 
    addToShoppingList, 
    clearShoppingList,
    subscriptionStatus
  } = useStore();
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('other');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  
  // Animation values
  const formHeight = useState(new Animated.Value(0))[0];
  const formOpacity = useState(new Animated.Value(0))[0];
  
  // Prepare sections for SectionList
  const getSections = () => {
    if (!groupByCategory) {
      // If not grouping by category, just show one section
      return [{
        title: 'Tous les articles',
        data: showCompleted 
          ? shoppingList.ingredients 
          : shoppingList.ingredients.filter(item => !item.checked)
      }];
    }
    
    // Group by category
    const grouped = {};
    
    // Initialize groups for all categories
    Object.keys(CATEGORY_CONFIG).forEach(key => {
      grouped[key] = [];
    });
    
    // Filter out checked items if not showing completed
    const itemsToGroup = showCompleted 
      ? shoppingList.ingredients 
      : shoppingList.ingredients.filter(item => !item.checked);
    
    // Group items
    itemsToGroup.forEach(item => {
      if (grouped[item.category]) {
        grouped[item.category].push(item);
      } else {
        grouped['other'].push(item);
      }
    });
    
    // Convert to sections and sort by CATEGORY_CONFIG order
    return Object.keys(grouped)
      .filter(category => grouped[category].length > 0) // Only show categories with items
      .map(category => ({
        title: category,
        displayTitle: CATEGORY_CONFIG[category]?.label || 'Autres',
        icon: CATEGORY_CONFIG[category]?.icon || 'basket-outline',
        order: CATEGORY_CONFIG[category]?.order || 99,
        data: grouped[category]
      }))
      .sort((a, b) => a.order - b.order);
  };
  
  // Toggle form visibility with animation
  const toggleAddForm = () => {
    if (showAddForm) {
      // Hide form
      Animated.parallel([
        Animated.timing(formHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(formOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        })
      ]).start(() => setShowAddForm(false));
    } else {
      // Show form
      setShowAddForm(true);
      Animated.parallel([
        Animated.timing(formHeight, {
          toValue: 200, // Approximate height of form
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        })
      ]).start();
    }
  };
  
  const addNewItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom d\'article');
      return;
    }
    
    // Generate simple UUID for item ID
    const itemId = Date.now().toString();
    
    addToShoppingList([{
      id: itemId,
      name: newItemName.trim(),
      quantity: newItemQuantity.trim() || '1',
      unit: '',
      category: newItemCategory
    }]);
    
    // Reset form
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemCategory('other');
    
    // Provide haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const confirmClearList = () => {
    Alert.alert(
      'Vider la liste',
      'Êtes-vous sûr de vouloir vider toute la liste de courses ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Vider',
          onPress: () => {
            clearShoppingList();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const shareShoppingList = async () => {
    try {
      // Format shopping list for sharing
      const sections = getSections();
      let message = "🛒 Liste de courses BatchMaster:\n\n";
      
      sections.forEach(section => {
        message += `${section.displayTitle}:\n`;
        section.data.forEach(item => {
          message += `${item.checked ? '✓' : '○'} ${item.name} (${item.quantity})\n`;
        });
        message += '\n';
      });
      
      await Share.share({
        message,
        title: 'Ma liste de courses BatchMaster'
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager la liste');
    }
  };
  
  const handleItemToggle = (itemId) => {
    toggleShoppingItem(itemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  // Render item row with swipe actions
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.itemRow,
          isDark && styles.itemRowDark,
          item.checked && styles.itemRowChecked,
          item.checked && (isDark ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#F9F9F9' })
        ]}
        onPress={() => handleItemToggle(item.id)}
      >
        <View style={styles.itemCheckbox}>
          {item.checked ? (
            <Ionicons name="checkbox" size={24} color={isDark ? '#4CAF50' : '#4CAF50'} />
          ) : (
            <Ionicons name="square-outline" size={24} color={isDark ? '#AAAAAA' : '#888888'} />
          )}
        </View>
        
        <View style={styles.itemContent}>
          <Text 
            style={[
              styles.itemName,
              isDark && styles.itemNameDark,
              item.checked && styles.itemTextChecked
            ]}
          >
            {item.name}
          </Text>
          {item.quantity && (
            <Text 
              style={[
                styles.itemQuantity,
                isDark && styles.itemQuantityDark,
                item.checked && styles.itemTextChecked
              ]}
            >
              {item.quantity}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render section header
  const renderSectionHeader = ({ section }) => {
    if (!groupByCategory) return null;
    
    return (
      <View style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
        <Ionicons 
          name={section.icon} 
          size={20} 
          color={isDark ? '#CCCCCC' : '#666666'} 
        />
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          {section.displayTitle}
        </Text>
        <Text style={[styles.sectionCount, isDark && styles.sectionCountDark]}>
          {section.data.length}
        </Text>
      </View>
    );
  };
  
  // Calculate stats
  const totalItems = shoppingList.ingredients.length;
  const checkedItems = shoppingList.ingredients.filter(item => item.checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) : 0;
  
  // Show premium feature banner for non-premium users
  const showPremiumBanner = !subscriptionStatus.isPremium;
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          Liste de courses
        </Text>
        
        {totalItems > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progress * 100}%` }
                ]} 
              />
            </View>
            <Text style={[styles.statsText, isDark && styles.statsTextDark]}>
              {checkedItems}/{totalItems} articles
            </Text>
          </View>
        )}
        
        {/* List options */}
        <View style={styles.optionsRow}>
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => setGroupByCategory(!groupByCategory)}
          >
            <Ionicons 
              name={groupByCategory ? "albums-outline" : "list-outline"} 
              size={20}
              color={isDark ? '#FFFFFF' : '#333333'}
            />
            <Text style={[styles.optionText, isDark && styles.optionTextDark]}>
              {groupByCategory ? 'Groupé' : 'Liste'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => setShowCompleted(!showCompleted)}
          >
            <Ionicons 
              name={showCompleted ? "eye-outline" : "eye-off-outline"} 
              size={20}
              color={isDark ? '#FFFFFF' : '#333333'}
            />
            <Text style={[styles.optionText, isDark && styles.optionTextDark]}>
              {showCompleted ? 'Tous' : 'À acheter'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={shareShoppingList}
          >
            <Ionicons 
              name="share-outline" 
              size={20}
              color={isDark ? '#FFFFFF' : '#333333'}
            />
            <Text style={[styles.optionText, isDark && styles.optionTextDark]}>
              Partager
            </Text>
          </TouchableOpacity>
          
          {totalItems > 0 && (
            <TouchableOpacity 
              style={[styles.optionButton, styles.clearButton]}
              onPress={confirmClearList}
            >
              <Ionicons 
                name="trash-outline" 
                size={20}
                color={isDark ? '#FF6B6B' : '#FF6B6B'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Premium feature banner */}
      {showPremiumBanner && (
        <View style={[styles.premiumBanner, isDark && styles.premiumBannerDark]}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.premiumBannerText}>
            Passez Premium pour synchroniser votre liste et accéder à plus de fonctionnalités
          </Text>
          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>Voir</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Empty state */}
      {totalItems === 0 && (
        <View style={styles.emptyState}>
          <Ionicons 
            name="basket-outline" 
            size={80}
            color={isDark ? '#444444' : '#DDDDDD'}
          />
          <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
            Votre panier est vide
          </Text>
          <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
            Ajoutez des articles à votre liste de courses en appuyant sur le bouton ci-dessous
          </Text>
        </View>
      )}
      
      {/* Shopping list */}
      {totalItems > 0 && (
        <SectionList
          sections={getSections()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      {/* Add new item form */}
      {showAddForm && (
        <Animated.View 
          style={[
            styles.addForm,
            isDark && styles.addFormDark,
            {
              maxHeight: formHeight,
              opacity: formOpacity
            }
          ]}
        >
          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Nom de l'article"
              placeholderTextColor={isDark ? '#888888' : '#AAAAAA'}
              value={newItemName}
              onChangeText={setNewItemName}
            />
            
            <TextInput
              style={[styles.quantityInput, isDark && styles.inputDark]}
              placeholder="Qté"
              placeholderTextColor={isDark ? '#888888' : '#AAAAAA'}
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
              keyboardType="numeric"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.categorySelector}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Ionicons 
              name={CATEGORY_CONFIG[newItemCategory]?.icon || 'basket-outline'} 
              size={20}
              color={isDark ? '#CCCCCC' : '#666666'}
            />
            <Text style={[styles.categoryText, isDark && styles.categoryTextDark]}>
              {CATEGORY_CONFIG[newItemCategory]?.label || 'Autres'}
            </Text>
            <Ionicons 
              name={showCategoryPicker ? "chevron-up" : "chevron-down"} 
              size={20}
              color={isDark ? '#CCCCCC' : '#666666'}
            />
          </TouchableOpacity>
          
          {showCategoryPicker && (
            <View style={[styles.categoryPicker, isDark && styles.categoryPickerDark]}>
              {Object.keys(CATEGORY_CONFIG)
                .sort((a, b) => CATEGORY_CONFIG[a].order - CATEGORY_CONFIG[b].order)
                .map(category => (
                  <TouchableOpacity 
                    key={category}
                    style={[
                      styles.categoryOption,
                      newItemCategory === category && styles.categoryOptionSelected
                    ]}
                    onPress={() => {
                      setNewItemCategory(category);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Ionicons 
                      name={CATEGORY_CONFIG[category].icon} 
                      size={20}
                      color={newItemCategory === category 
                        ? (isDark ? '#FFFFFF' : '#FF6B6B') 
                        : (isDark ? '#CCCCCC' : '#666666')}
                    />
                    <Text 
                      style={[
                        styles.categoryOptionText,
                        isDark && styles.categoryOptionTextDark,
                        newItemCategory === category && styles.categoryOptionTextSelected
                      ]}
                    >
                      {CATEGORY_CONFIG[category].label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
          
          <View style={styles.formButtons}>
            <TouchableOpacity 
              style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
              onPress={toggleAddForm}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Annuler
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.addButton, !newItemName.trim() && styles.addButtonDisabled]}
              onPress={addNewItem}
              disabled={!newItemName.trim()}
            >
              <Text style={styles.buttonText}>
                Ajouter
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      
      {/* Add button */}
      <TouchableOpacity 
        style={[styles.fab, isDark && styles.fabDark]}
        onPress={toggleAddForm}
      >
        <Ionicons 
          name={showAddForm ? "close" : "add"} 
          size={24}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Complete StyleSheet definition
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
    marginBottom: 15,
    color: '#333333',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  statsContainer: {
    marginBottom: 15,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'right',
  },
  statsTextDark: {
    color: '#AAAAAA',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333333',
  },
  optionTextDark: {
    color: '#FFFFFF',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 10,
  },
  premiumBannerDark: {
    backgroundColor: '#2A2A00',
  },
  premiumBannerText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#996500',
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  premiumButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333333',
  },
  emptyStateTitleDark: {
    color: '#FFFFFF',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
  },
  emptyStateTextDark: {
    color: '#AAAAAA',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 90, // Space for FAB
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionHeaderDark: {
    backgroundColor: '#1A1A1A',
    borderBottomColor: '#333333',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333333',
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  sectionCount: {
    fontSize: 14,
    color: '#888888',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sectionCountDark: {
    color: '#CCCCCC',
    backgroundColor: '#333333',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemRowDark: {
    backgroundColor: '#111111',
    borderBottomColor: '#222222',
  },
  itemRowChecked: {
    opacity: 0.8,
  },
  itemCheckbox: {
    marginRight: 15,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  itemNameDark: {
    color: '#FFFFFF',
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 10,
  },
  itemQuantityDark: {
    color: '#AAAAAA',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabDark: {
    backgroundColor: '#FF6B6B',
  },
  addForm: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addFormDark: {
    backgroundColor: '#1A1A1A',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333333',
  },
  inputDark: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
  },
  quantityInput: {
    width: 70,
    height: 46,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333333',
    marginLeft: 10,
    textAlign: 'center',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  categoryText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
  },
  categoryTextDark: {
    color: '#FFFFFF',
  },
  categoryPicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 15,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  categoryPickerDark: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  categoryOptionSelected: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  categoryOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
  },
  categoryOptionTextDark: {
    color: '#FFFFFF',
  },
  categoryOptionTextSelected: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    height: 46,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonDark: {
    backgroundColor: '#333333',
  },
  addButton: {
    flex: 1,
    height: 46,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#666666',
  }
});