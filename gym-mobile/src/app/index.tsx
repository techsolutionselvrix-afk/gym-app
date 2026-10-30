
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router'; 

import { useState } from 'react';
import { Colors } from '@/constants/theme';

export default function Index() {
  const systemTheme = useColorScheme();

  const [manualTheme, setManualTheme] = useState<
    'light' | 'dark' | null
  >(null);

  const currentTheme =
    manualTheme ?? (systemTheme === 'dark' ? 'dark' : 'light');

  const theme = Colors[currentTheme];
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoSymbol}>✳</Text>
          </View>

          <Text style={styles.logoText}>GYMSYNC</Text>
        </View>

        <Pressable
          style={styles.themeButton}
          onPress={() =>
            setManualTheme(currentTheme === 'dark' ? 'light' : 'dark')
          }
        >
          <Text style={styles.themeIcon}>
            {currentTheme === 'dark' ? '☀' : '☾'}
          </Text>
        </Pressable>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>YOUR FITNESS JOURNEY STARTS HERE</Text>
        </View>

        <Text style={styles.heading}>
          Move better.{' \n'}
          <Text style={styles.headingAccent}>Feel stronger.</Text>
        </Text>

        <Text style={styles.description}>
          Your gym, your goals, your progress. Everything you need
          to build a healthier lifestyle, all in one place.
        </Text>

        {/* Decorative fitness card */}
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Text style={styles.dumbbell}>⚒</Text>
          </View>

          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>A stronger you</Text>
            <Text style={styles.featureSubtitle}>
              Small steps. Lasting results.
            </Text>
          </View>

          <Text style={styles.featureArrow}>↗</Text>
        </View>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomSection}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/choose-role')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </Pressable>

        <Pressable
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginHighlight}>Log in</Text>
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          MADE FOR YOUR EVERYDAY PROGRESS
        </Text>
      </View>
    </View>
  );
}

function createStyles(theme: (typeof Colors)['light']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 25,
      paddingTop: 58,
      paddingBottom: 20,
      justifyContent: 'space-between',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    logoIcon: {
      width: 37,
      height: 37,
      borderRadius: 12,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    logoSymbol: {
      color: theme.background,
      fontSize: 25,
      fontWeight: '900',
    },

    logoText: {
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: 2,
      color: theme.text,
    },

    themeButton: {
      width: 42,
      height: 42,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    themeIcon: {
      fontSize: 23,
      color: theme.text,
    },

    content: {
      marginTop: 25,
      marginBottom: 25,
    },

    badge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 11,
      paddingVertical: 9,
      borderRadius: 20,
      backgroundColor: theme.card,
      marginBottom: 25,
    },

    badgeDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.primary,
    },

    badgeText: {
      color: theme.secondaryText,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.7,
    },

    heading: {
      fontSize: 43,
      lineHeight: 51,
      fontWeight: '800',
      letterSpacing: -1.8,
      color: theme.text,
    },

    headingAccent: {
      color: theme.primary,
    },

    description: {
      fontSize: 15,
      lineHeight: 24,
      color: theme.secondaryText,
      marginTop: 18,
      marginBottom: 27,
    },

    featureCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 15,
      borderRadius: 18,
    },

    featureIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: theme.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },

    dumbbell: {
      fontSize: 25,
      color: theme.primary,
    },

    featureContent: {
      flex: 1,
      marginLeft: 13,
    },

    featureTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text,
    },

    featureSubtitle: {
      fontSize: 12,
      color: theme.secondaryText,
      marginTop: 5,
    },

    featureArrow: {
      fontSize: 24,
      color: theme.primary,
    },

    bottomSection: {
      width: '100%',
    },

    primaryButton: {
      backgroundColor: theme.primary,
      borderRadius: 15,
      paddingHorizontal: 20,
      paddingVertical: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    primaryButtonText: {
      color: currentButtonText(theme.primary),
      fontSize: 16,
      fontWeight: '800',
    },

    buttonArrow: {
      color: currentButtonText(theme.primary),
      fontSize: 21,
      marginLeft: 10,
    },

    loginButton: {
      alignItems: 'center',
      paddingVertical: 19,
    },

    loginText: {
      color: theme.secondaryText,
      fontSize: 13,
    },

    loginHighlight: {
      color: theme.primary,
      fontWeight: '800',
    },

    footer: {
      textAlign: 'center',
      fontSize: 9,
      letterSpacing: 1.5,
      fontWeight: '700',
      color: theme.secondaryText,
      marginTop: 4,
    },
  });
}

function currentButtonText(background: string) {
  return background === '#A8C5AE' ? '#141A17' : '#FFFFFF';
}

