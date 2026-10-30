import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';

export default function SuperAdminDashboard() {
  const { theme, themeMode } = useAppTheme();

  const stats = [
    {
      title: 'Total Gyms',
      value: '125',
      icon: 'business-outline' as const,
      color: '#6366F1',
    },
    {
      title: 'Active Gyms',
      value: '110',
      icon: 'checkmark-circle-outline' as const,
      color: '#16A34A',
    },
    {
      title: 'Disabled Gyms',
      value: '15',
      icon: 'ban-outline' as const,
      color: '#EF4444',
    },
    {
      title: 'Total Members',
      value: '12,450',
      icon: 'people-outline' as const,
      color: '#0EA5E9',
    },
    {
      title: 'Total Revenue',
      value: '₹2.5L',
      icon: 'wallet-outline' as const,
      color: '#D97706',
    },
    {
      title: 'Subscriptions',
      value: '110',
      icon: 'card-outline' as const,
      color: '#9333EA',
    },
  ];

  const recentGyms = [
    {
      name: 'Fitness Hub',
      owner: 'Rahul Sharma',
      status: 'Active',
      date: '30 Oct 2026',
    },
    {
      name: 'Power Zone Gym',
      owner: 'Amit Verma',
      status: 'Active',
      date: '29 Oct 2026',
    },
    {
      name: 'Fit Life Studio',
      owner: 'Priya Patel',
      status: 'Pending',
      date: '28 Oct 2026',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Gyms',
      icon: 'business-outline' as const,
      route: '/(super-admin)/gyms' as const,
    },
    {
      title: 'Manage Plans',
      icon: 'pricetags-outline' as const,
      route: '/(super-admin)/plans' as const,
    },
    {
      title: 'Billing',
      icon: 'wallet-outline' as const,
      route: '/(super-admin)/billing' as const,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.secondaryText }]}>
              Welcome back,
            </Text>

            <Text style={[styles.title, { color: theme.text }]}>
              Super Admin
            </Text>

            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              Here's your platform overview.
            </Text>
          </View>

          <Pressable
            style={[
              styles.notificationButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={23}
              color={theme.text}
            />

            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        {/* Platform Overview */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Platform Overview
          </Text>

          <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>
            Overall GymSync statistics
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsGrid}>
          {stats.map((item, index) => (
            <View
              key={index}
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: item.color + '18' },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.color}
                />
              </View>

              <Text style={[styles.statValue, { color: theme.text }]}>
                {item.value}
              </Text>

              <Text
                style={[
                  styles.statTitle,
                  { color: theme.secondaryText },
                ]}
              >
                {item.title}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          {quickActions.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(item.route)}
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: theme.inputBackground },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={23}
                  color={theme.primary}
                />
              </View>

              <Text style={[styles.actionTitle, { color: theme.text }]}>
                {item.title}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={theme.secondaryText}
              />
            </Pressable>
          ))}
        </View>

        {/* Recent Registrations */}
        <View style={styles.recentHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Gym Registrations
          </Text>

          <Pressable
            onPress={() => router.push('/(super-admin)/gyms')}
          >
            <Text style={[styles.viewAll, { color: theme.primary }]}>
              View All
            </Text>
          </Pressable>
        </View>

        {recentGyms.map((gym, index) => (
          <View
            key={index}
            style={[
              styles.gymCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.gymIcon,
                { backgroundColor: theme.inputBackground },
              ]}
            >
              <Ionicons
                name="barbell-outline"
                size={23}
                color={theme.primary}
              />
            </View>

            <View style={styles.gymInfo}>
              <Text style={[styles.gymName, { color: theme.text }]}>
                {gym.name}
              </Text>

              <Text
                style={[
                  styles.gymOwner,
                  { color: theme.secondaryText },
                ]}
              >
                Owner: {gym.owner}
              </Text>

              <Text
                style={[
                  styles.gymDate,
                  { color: theme.secondaryText },
                ]}
              >
                {gym.date}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    gym.status === 'Active' ? '#DCFCE7' : '#FEF3C7',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      gym.status === 'Active' ? '#15803D' : '#B45309',
                  },
                ]}
              >
                {gym.status}
              </Text>
            </View>
          </View>
        ))}

        {/* Footer */}
        <Text style={[styles.footer, { color: theme.secondaryText }]}>
          GymSync Super Admin • Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  greeting: {
    fontSize: 13,
    marginBottom: 5,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 13,
    marginTop: 6,
  },

  notificationButton: {
    width: 45,
    height: 45,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },

  sectionHeader: {
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  sectionSubtitle: {
    fontSize: 12,
    marginTop: 5,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 28,
  },

  statCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    minHeight: 130,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },

  statTitle: {
    fontSize: 12,
    marginTop: 5,
  },

  actionsContainer: {
    gap: 10,
    marginBottom: 28,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    gap: 13,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  viewAll: {
    fontSize: 13,
    fontWeight: '700',
  },

  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
  },

  gymIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gymInfo: {
    flex: 1,
  },

  gymName: {
    fontSize: 14,
    fontWeight: '700',
  },

  gymOwner: {
    fontSize: 11,
    marginTop: 4,
  },

  gymDate: {
    fontSize: 10,
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 20,
  },
});