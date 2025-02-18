import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useStore } from '../../store';
import { Phase, Task } from '../../types/schema';

const { width } = Dimensions.get('window');

// Sample cooking phases data
const cookingPhases: Phase[] = [
  {
    num: '1',
    n: 'Préparation',
    st: '0min',
    en: '30min',
    sec: [
      {
        n: 'Mise en place',
        t: [
          {
            t: 'Sortir tous les ingrédients du réfrigérateur',
            i: 'general',
            c: false,
            pr: 'high'
          },
          {
            t: 'Préparer les contenants de stockage',
            i: 'general',
            c: false,
            pr: 'medium'
          },
          {
            t: 'Préchauffer le four à 200°C',
            i: 'equipement',
            c: false,
            pr: 'high'
          }
        ]
      },
      {
        n: 'Préparation des légumes',
        t: [
          {
            t: 'Éplucher et couper les carottes en dés',
            i: 'carotte',
            c: false,
            pr: 'medium'
          },
          {
            t: 'Éplucher et émincer les oignons',
            i: 'oignon',
            c: false,
            pr: 'medium'
          },
          {
            t: 'Laver et couper les courgettes en rondelles',
            i: 'courgette',
            c: false,
            pr: 'medium'
          }
        ]
      }
    ]
  },
  {
    num: '2',
    n: 'Cuisson',
    st: '30min',
    en: '1h30',
    sec: [
      {
        n: 'Cuisson des féculents',
        t: [
          {
            t: 'Faire bouillir l\'eau pour les pâtes',
            i: 'pâtes',
            c: false,
            pr: 'high'
          },
          {
            t: 'Cuire le riz selon les instructions',
            i: 'riz',
            c: false,
            pr: 'medium'
          }
        ]
      },
      {
        n: 'Cuisson des plats principaux',
        t: [
          {
            t: 'Préparer la sauce tomate',
            i: 'sauce',
            c: false,
            pr: 'medium'
          },
          {
            t: 'Faire revenir les légumes',
            i: 'légumes',
            c: false,
            pr: 'high'
          },
          {
            t: 'Cuire les protéines',
            i: 'protéines',
            c: false,
            pr: 'high'
          }
        ]
      }
    ]
  },
  {
    num: '3',
    n: 'Conditionnement',
    st: '1h30',
    en: '2h',
    sec: [
      {
        n: 'Refroidissement',
        t: [
          {
            t: 'Laisser refroidir les plats cuits',
            i: 'general',
            c: false,
            pr: 'low'
          }
        ]
      },
      {
        n: 'Portionnement',
        t: [
          {
            t: 'Diviser les plats en portions',
            i: 'portions',
            c: false,
            pr: 'high'
          },
          {
            t: 'Étiqueter les contenants',
            i: 'étiquettes',
            c: false,
            pr: 'medium'
          },
          {
            t: 'Ranger au réfrigérateur ou congélateur',
            i: 'stockage',
            c: false,
            pr: 'high'
          }
        ]
      }
    ]
  }
];

export default function CookingModeScreen() {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [timers, setTimers] = useState<{[key: string]: number}>({});
  const [progressValue] = useState(new Animated.Value(0));
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { activeMenuId } = useStore();

  // Calculate total tasks and update progress
  useEffect(() => {
    let total = 0;
    let completed = 0;
    
    cookingPhases.forEach(phase => {
      phase.sec.forEach(section => {
        total += section.t.length;
        completed += section.t.filter(task => task.c).length;
      });
    });
    
    setTotalTasks(total);
    setCompletedTasks(completed);
    
    Animated.timing(progressValue, {
      toValue: total > 0 ? completed / total : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [cookingPhases]);

  const toggleTaskCompletion = (phaseIndex: number, sectionIndex: number, taskIndex: number) => {
    // Create a deep copy of phases to modify
    const updatedPhases = JSON.parse(JSON.stringify(cookingPhases));
    const currentTask = updatedPhases[phaseIndex].sec[sectionIndex].t[taskIndex];
    currentTask.c = !currentTask.c;
    
    // Check if all tasks in current phase are completed
    const allTasksInPhaseCompleted = updatedPhases[phaseIndex].sec.every(
      section => section.t.every(task => task.c)
    );
    
    if (allTasksInPhaseCompleted && phaseIndex < updatedPhases.length - 1) {
      Alert.alert(
        "Phase complétée !",
        "Toutes les tâches de cette phase sont terminées. Passer à la phase suivante ?",
        [
          {
            text: "Rester ici",
            style: "cancel"
          },
          { 
            text: "Phase suivante", 
            onPress: () => setActivePhaseIndex(phaseIndex + 1)
          }
        ]
      );
    }
    
    // Update total completed tasks count
    let completed = 0;
    updatedPhases.forEach(phase => {
      phase.sec.forEach(section => {
        completed += section.t.filter(task => task.c).length;
      });
    });
    
    setCompletedTasks(completed);
  };

  const startTimer = (taskId: string) => {
    // Implementation of timer functionality
    const newTimers = {...timers};
    newTimers[taskId] = 0; // Start at 0 seconds
    setTimers(newTimers);
    
    // In a real app, you would set up an interval to increment this timer
    // and probably store it in a more robust way
  };

  const renderPhaseIndicator = () => {
    return (
      <View style={styles.phaseIndicatorContainer}>
        {cookingPhases.map((phase, index) => (
          <TouchableOpacity 
            key={phase.num}
            style={[
              styles.phaseIndicator,
              activePhaseIndex === index && styles.activePhaseIndicator,
              index < activePhaseIndex && styles.completedPhaseIndicator
            ]}
            onPress={() => setActivePhaseIndex(index)}
          >
            <Text 
              style={[
                styles.phaseNumber, 
                (activePhaseIndex === index || index < activePhaseIndex) && 
                styles.activePhaseNumber
              ]}
            >
              {phase.num}
            </Text>
            <Text 
              style={[
                styles.phaseName,
                (activePhaseIndex === index || index < activePhaseIndex) && 
                styles.activePhaseName
              ]}
            >
              {phase.n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTaskCard = (task: Task, phaseIndex: number, sectionIndex: number, taskIndex: number) => {
    const priorityColors = {
      high: '#FF6B6B',
      medium: '#FFB347',
      low: '#4CAF50'
    };
    
    return (
      <TouchableOpacity
        key={`${phaseIndex}-${sectionIndex}-${taskIndex}`}
        style={[
          styles.taskCard,
          isDark && styles.taskCardDark,
          task.c && styles.completedTaskCard
        ]}
        onPress={() => toggleTaskCompletion(phaseIndex, sectionIndex, taskIndex)}
      >
        <View style={styles.taskLeftSection}>
          <View 
            style={[
              styles.priorityIndicator, 
              { backgroundColor: priorityColors[task.pr as keyof typeof priorityColors] }
            ]} 
          />
          <View style={styles.taskContent}>
            <Text 
              style={[
                styles.taskText, 
                isDark && styles.taskTextDark,
                task.c && styles.completedTaskText
              ]}
            >
              {task.t}
            </Text>
            <Text 
              style={[
                styles.taskCategory, 
                isDark && styles.taskCategoryDark
              ]}
            >
              {task.i}
            </Text>
          </View>
        </View>
        
        <View style={styles.taskActions}>
          {/* Timer button - you can implement this functionality */}
          {!task.c && (
            <TouchableOpacity 
              style={styles.timerButton}
              onPress={() => startTimer(`${phaseIndex}-${sectionIndex}-${taskIndex}`)}
            >
              <Ionicons 
                name="timer-outline" 
                size={24} 
                color={isDark ? "#CCCCCC" : "#666666"} 
              />
            </TouchableOpacity>
          )}
          
          {/* Completion checkmark */}
          <View style={[
            styles.checkCircle,
            task.c && styles.checkedCircle
          ]}>
            {task.c && (
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const currentPhase = cookingPhases[activePhaseIndex];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          Mode cuisine
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          {activeMenuId ? 'Menu actif' : 'Aucun menu sélectionné'}
        </Text>
        
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]} 
          />
          <Text style={styles.progressText}>
            {completedTasks}/{totalTasks} tâches complétées
          </Text>
        </View>
      </View>
      
      {renderPhaseIndicator()}
      
      <ScrollView style={styles.content}>
        {currentPhase.sec.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              {section.n}
            </Text>
            
            {section.t.map((task, taskIndex) => 
              renderTaskCard(task, activePhaseIndex, sectionIndex, taskIndex)
            )}
          </View>
        ))}
        
        {/* Completed tasks section */}
        <View style={styles.completedTasksSection}>
          <TouchableOpacity style={styles.completedTasksHeader}>
            <Text style={[styles.completedTasksTitle, isDark && styles.completedTasksTitleDark]}>
              Tâches terminées
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={24} 
              color={isDark ? "#CCCCCC" : "#666666"} 
            />
          </TouchableOpacity>
          
          {/* Show completed tasks here - this could be a collapsible section */}
        </View>
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
    color: '#333333',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  subtitleDark: {
    color: '#CCCCCC',
  },
  progressContainer: {
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  phaseIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phaseIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  activePhaseIndicator: {
    // Style for active phase
  },
  completedPhaseIndicator: {
    // Style for completed phases
  },
  phaseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 5,
  },
  activePhaseNumber: {
    backgroundColor: '#FF6B6B',
    color: '#FFFFFF',
  },
  phaseName: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  activePhaseName: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333333',
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCardDark: {
    backgroundColor: '#1A1A1A',
  },
  completedTaskCard: {
    backgroundColor: '#F5FFF5',
  },
  completedTaskCardDark: {
    backgroundColor: '#1F2A1F',
  },
  taskLeftSection: {
    flexDirection: 'row',
    flex: 1,
  },
  priorityIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
    alignSelf: 'stretch',
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  taskTextDark: {
    color: '#FFFFFF',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  taskCategory: {
    fontSize: 14,
    color: '#666666',
  },
  taskCategoryDark: {
    color: '#AAAAAA',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerButton: {
    marginRight: 15,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCircle: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  completedTasksSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  completedTasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  completedTasksHeaderDark: {
    borderBottomColor: '#333333',
  },
  completedTasksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  completedTasksTitleDark: {
    color: '#AAAAAA',
  }
});