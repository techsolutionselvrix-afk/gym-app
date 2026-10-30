
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';

const meals = [
  {
    time: '08:00 AM',
    name: 'Breakfast',
    food: 'Oats, banana & boiled eggs',
    calories: 350,
    emoji: '🍳',
  },
  {
    time: '01:00 PM',
    name: 'Lunch',
    food: 'Roti, dal, paneer & salad',
    calories: 500,
    emoji: '🥗',
  },
  {
    time: '04:30 PM',
    name: 'Evening Snack',
    food: 'Fruit & handful of almonds',
    calories: 200,
    emoji: '🍎',
  },
  {
    time: '08:00 PM',
    name: 'Dinner',
    food: 'Rice, vegetables & dal',
    calories: 400,
    emoji: '🍲',
  },
];

export default function DietPlanScreen() {
  const { theme, themeMode } = useAppTheme();
  const [waterGlasses, setWaterGlasses] = useState(0);

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.heading}>Diet Plan</Text>
            <Text style={styles.subtitle}>Fuel your fitness journey</Text>
          </View>
        </View>

        <View style={styles.calorieCard}>
          <Text style={styles.cardLabel}>DAILY CALORIE GOAL</Text>
          <View style={styles.calorieRow}>
            <Text style={styles.calorieNumber}>1,450</Text>
            <Text style={styles.calorieUnit}>kcal / day</Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.cardNote}>
            Sample target · Your personal goal may differ
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <Text style={styles.mealCount}>4 meals</Text>
        </View>

        {meals.map((meal) => (
          <View style={styles.mealCard} key={meal.name}>
            <View style={styles.mealEmoji}>
              <Text style={styles.emoji}>{meal.emoji}</Text>
            </View>

            <View style={styles.mealDetails}>
              <Text style={styles.mealTime}>{meal.time}</Text>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealFood}>{meal.food}</Text>
            </View>

            <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
          </View>
        ))}

        <View style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <Text style={styles.waterEmoji}>💧</Text>
            <View style={styles.waterText}>
              <Text style={styles.waterTitle}>Water Intake</Text>
              <Text style={styles.waterSubtitle}>
                {waterGlasses} of 8 glasses
              </Text>
            </View>
          </View>

          <View style={styles.waterGlasses}>
            {Array.from({ length: 8 }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.waterDrop,
                  index < waterGlasses && styles.waterDropFilled,
                ]}
              >
                <Text style={styles.dropText}>💧</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.waterButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              setWaterGlasses((current) => Math.min(current + 1, 8))
            }
          >
            <Text style={styles.waterButtonText}>
              {waterGlasses === 8 ? 'Daily Goal Completed ✓' : '+ Add a Glass'}
            </Text>
          </Pressable>

          {waterGlasses > 0 && (
            <Pressable
              onPress={() => setWaterGlasses(0)}
              style={styles.resetButton}
            >
              <Text style={styles.resetText}>Reset tracker</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.disclaimer}>
          This is a sample diet plan for UI demonstration, not personalized
          nutrition advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: (typeof Colors)['light']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      padding: 20,
      paddingBottom: 32,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      gap: 14,
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backText: {
      fontSize: 32,
      color: theme.text,
      lineHeight: 36,
      marginTop: -4,
    },
    headerText: {
      flex: 1,
    },
    heading: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
    },
    subtitle: {
      fontSize: 13,
      color: theme.secondaryText,
      marginTop: 3,
    },
    calorieCard: {
      backgroundColor: theme.primary,
      borderRadius: 22,
      padding: 22,
      marginBottom: 28,
    },
    cardLabel: {
      color: '#FFFFFF',
      opacity: 0.85,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
    },
    calorieRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 8,
      marginTop: 10,
    },
    calorieNumber: {
      fontSize: 38,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    calorieUnit: {
      color: '#FFFFFF',
      fontSize: 13,
    },
    progressBackground: {
      height: 7,
      backgroundColor: 'rgba(255,255,255,0.25)',
      borderRadius: 10,
      marginTop: 16,
      overflow: 'hidden',
    },
    progressFill: {
      width: '65%',
      height: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
    },
    cardNote: {
      fontSize: 11,
      color: '#FFFFFF',
      opacity: 0.8,
      marginTop: 10,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: theme.text,
    },
    mealCount: {
      fontSize: 12,
      color: theme.secondaryText,
    },
    mealCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      marginBottom: 12,
      gap: 12,
    },
    mealEmoji: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor: theme.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emoji: {
      fontSize: 25,
    },
    mealDetails: {
      flex: 1,
    },
    mealTime: {
      fontSize: 10,
      color: theme.secondaryText,
      marginBottom: 3,
    },
    mealName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    mealFood: {
      fontSize: 11,
      color: theme.secondaryText,
      marginTop: 4,
      lineHeight: 16,
    },
    mealCalories: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.primary,
    },
    waterCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 18,
      marginTop: 12,
    },
    waterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    waterEmoji: {
      fontSize: 30,
    },
    waterText: {
      flex: 1,
    },
    waterTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.text,
    },
    waterSubtitle: {
      fontSize: 12,
      color: theme.secondaryText,
      marginTop: 4,
    },
    waterGlasses: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      marginBottom: 18,
      gap: 4,
    },
    waterDrop: {
      width: 30,
      height: 38,
      borderRadius: 10,
      backgroundColor: theme.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    waterDropFilled: {
      backgroundColor: '#C5E6F4',
    },
    dropText: {
      fontSize: 16,
    },
    waterButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 13,
      alignItems: 'center',
    },
    waterButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    pressed: {
      opacity: 0.75,
    },
    resetButton: {
      alignItems: 'center',
      paddingTop: 12,
    },
    resetText: {
      fontSize: 12,
      color: theme.secondaryText,
    },
    disclaimer: {
      fontSize: 11,
      color: theme.secondaryText,
      textAlign: 'center',
      lineHeight: 17,
      marginTop: 20,
    },
  });
}

