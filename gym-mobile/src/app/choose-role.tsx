
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';

export default function ChooseRoleScreen() {
  const { theme, themeMode } = useAppTheme();

  const roles = [
    {
      id: 'member',
      icon: '👤',
      title: 'Gym Member',
      description:
        'Track your workouts, attendance, membership, and fitness progress.',
    },
    {
      id: 'owner',
      icon: '🏋️',
      title: 'Gym Owner',
      description:
        'Manage your gym, members, membership plans, and daily operations.',
    },
    {
      id: 'admin',
      icon: '🛡️',
      title: 'Super Admin',
      description:
        'Manage gyms and oversee the GymSync platform.',
    },
  ];


const handleRoleSelect = (role: string) => {
  console.log('Selected role on Choose Role page:', role);

  if (role === 'member') {
    router.push({
      pathname: '/(auth)/register',
      params: { role: 'member' },
    });
  } else if (role === 'owner' || role === 'admin') {
    router.push({
      pathname: '/(auth)/login',
      params: { role: role },
    });
  }
};



  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.text }]}>
            ← Back
          </Text>
        </Pressable>

        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: theme.primary }]}>
            <Text style={styles.logoText}>G</Text>
          </View>

          <Text style={[styles.brand, { color: theme.text }]}>
            GYMSYNC
          </Text>

          <Text style={[styles.heading, { color: theme.text }]}>
            Choose Your Role
          </Text>

          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            Select how you want to use GymSync.
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <Pressable
              key={role.id}
              onPress={() => handleRoleSelect(role.id)}
              style={({ pressed }) => [
                styles.roleCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.inputBackground },
                ]}
              >
                <Text style={styles.roleIcon}>{role.icon}</Text>
              </View>

              <View style={styles.roleContent}>
                <Text style={[styles.roleTitle, { color: theme.text }]}>
                  {role.title}
                </Text>

                <Text
                  style={[
                    styles.roleDescription,
                    { color: theme.secondaryText },
                  ]}
                >
                  {role.description}
                </Text>
              </View>

              <Text style={[styles.arrow, { color: theme.primary }]}>
                →
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.footer, { color: theme.secondaryText }]}>
          Your fitness journey starts here.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    marginBottom: 18,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  brand: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 24,
  },
  heading: {
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  rolesContainer: {
    gap: 14,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 13,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIcon: {
    fontSize: 25,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },
  roleDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 23,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 28,
  },
});

