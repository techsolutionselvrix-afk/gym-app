import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  StatusBar,
} from 'react-native';

import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function OwnerDashboard() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const stats = [
    {
      label: 'Total Members',
      value: '248',
      icon: 'people-outline',
    },
    {
      label: "Today's Attendance",
      value: '86',
      icon: 'calendar-outline',
    },
    {
      label: 'Pending Payments',
      value: '12',
      icon: 'wallet-outline',
    },
    {
      label: 'Expiring Soon',
      value: '08',
      icon: 'time-outline',
    },
  ] as const;

  const quickActions = [
    {
      title: 'Add Member',
      icon: 'person-add-outline',
      route: '/(owner)/members',
    },
    {
      title: 'Check Attendance',
      icon: 'clipboard-outline',
      route: '/(owner)/attendance',
    },
    {
      title: 'Create Diet Plan',
      icon: 'nutrition-outline',
      route: '/(owner)/diet-plans',
    },
    {
      title: 'Schedule Class',
      icon: 'calendar-outline',
      route: '/(owner)/classes',
    },
  ] as const;

  console.log('Ionicons:', typeof Ionicons);
console.log('SafeAreaView:', typeof SafeAreaView);
console.log('View:', typeof View);
console.log('Text:', typeof Text);
console.log('Pressable:', typeof Pressable);
console.log('ScrollView:', typeof ScrollView);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
      />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[styles.brand, { color: theme.primary }]}>
                GYMSYNC
              </Text>

              <Text style={[styles.greeting, { color: theme.text }]}>
                Welcome, Owner! 👋
              </Text>

              <Text
                style={[styles.subtitle, { color: theme.secondaryText }]}
              >
                Manage your gym, your way.
              </Text>
            </View>

            <View style={styles.headerRight}>
              <Pressable
                style={[
                  styles.headerButton,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() =>
                  router.push('/settings/notifications' as any)
                }
                accessibilityLabel="Notifications"
              >
                <Ionicons
                  name="notifications-outline"
                  size={23}
                  color={theme.text}
                />

                <View style={styles.notificationDot} />
              </Pressable>

              <Pressable
                style={[
                  styles.profile,
                  { backgroundColor: theme.inputBackground },
                ]}
                onPress={() => router.push('/(owner)/profile' as any)}
                accessibilityLabel="Owner profile"
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={theme.primary}
                />
              </Pressable>
            </View>
          </View>

          {/* Gym Overview */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Gym Overview
            </Text>

            <Ionicons
              name="stats-chart-outline"
              size={21}
              color={theme.primary}
            />
          </View>

          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View
                key={stat.label}
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
                    styles.statIconContainer,
                    { backgroundColor: theme.inputBackground },
                  ]}
                >
                  <Ionicons
                    name={stat.icon}
                    size={23}
                    color={theme.primary}
                  />
                </View>

                <Text style={[styles.statValue, { color: theme.text }]}>
                  {stat.value}
                </Text>

                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.secondaryText },
                  ]}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>

          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <Pressable
                key={action.title}
                style={({ pressed }) => [
                  styles.actionCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push(action.route as any)}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.inputBackground },
                  ]}
                >
                  <Ionicons
                    name={action.icon}
                    size={25}
                    color={theme.primary}
                  />
                </View>

                <Text
                  style={[styles.actionTitle, { color: theme.text }]}
                >
                  {action.title}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={theme.secondaryText}
                />
              </Pressable>
            ))}
          </View>

          {/* Red List */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Red List
            </Text>

            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>Attention</Text>
            </View>
          </View>

          <View
            style={[
              styles.redListCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Pressable
              style={styles.alertRow}
              onPress={() => router.push('/(owner)/red-list' as any)}
            >
              <View
                style={[
                  styles.alertIcon,
                  { backgroundColor: '#FEE2E2' },
                ]}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color="#DC2626"
                />
              </View>

              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: theme.text }]}>
                  Membership Expiring
                </Text>

                <Text
                  style={[
                    styles.alertSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  Members needing renewal
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.secondaryText}
              />
            </Pressable>

            <View
              style={[styles.divider, { backgroundColor: theme.border }]}
            />

            <Pressable
              style={styles.alertRow}
              onPress={() => router.push('/(owner)/red-list' as any)}
            >
              <View
                style={[
                  styles.alertIcon,
                  { backgroundColor: '#FEF3C7' },
                ]}
              >
                <Ionicons
                  name="wallet-outline"
                  size={22}
                  color="#B45309"
                />
              </View>

              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: theme.text }]}>
                  Pending Payments
                </Text>

                <Text
                  style={[
                    styles.alertSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  Review outstanding dues
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.secondaryText}
              />
            </Pressable>

            <View
              style={[styles.divider, { backgroundColor: theme.border }]}
            />

            <Pressable
              style={styles.alertRow}
              onPress={() => router.push('/(owner)/red-list' as any)}
            >
              <View
                style={[
                  styles.alertIcon,
                  { backgroundColor: '#DBEAFE' },
                ]}
              >
                <Ionicons
                  name="person-remove-outline"
                  size={22}
                  color="#2563EB"
                />
              </View>

              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: theme.text }]}>
                  Inactive Members
                </Text>

                <Text
                  style={[
                    styles.alertSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  Check attendance inactivity
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.secondaryText}
              />
            </Pressable>

            <Pressable
              style={[
                styles.viewAllButton,
                { backgroundColor: theme.inputBackground },
              ]}
              onPress={() => router.push('/(owner)/red-list' as any)}
            >
              <Text
                style={[styles.viewAllText, { color: theme.primary }]}
              >
                View Full Red List
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color={theme.primary}
              />
            </Pressable>
          </View>

          {/* Subscription Card */}
          <View
            style={[
              styles.subscriptionCard,
              { backgroundColor: theme.primary },
            ]}
          >
            <View style={styles.subscriptionTop}>
              <View style={styles.subscriptionIcon}>
                <Ionicons
                  name="diamond-outline"
                  size={27}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.subscriptionText}>
                <Text style={styles.subscriptionTitle}>
                  GymSync Subscription
                </Text>

                <Text style={styles.subscriptionSubtitle}>
                  Manage your app subscription and explore plans.
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.subscriptionButton,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                router.push('/(owner)/subscription' as any)
              }
            >
              <Text
                style={[
                  styles.subscriptionButtonText,
                  { color: theme.primary },
                ]}
              >
                View Subscription Plans
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color={theme.primary}
              />
            </Pressable>
          </View>

          {/* Footer */}
          <Text style={[styles.footer, { color: theme.secondaryText }]}>
            GYMSYNC • Your gym, under control. 💚
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  screen: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 10,
  },

  headerText: {
    flex: 1,
  },

  brand: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },

  greeting: {
    fontSize: 23,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 12,
    marginTop: 6,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  profile: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },

  statCard: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '42%',
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 145,
  },

  statIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  statValue: {
    fontSize: 25,
    fontWeight: '800',
  },

  statLabel: {
    fontSize: 11,
    marginTop: 5,
    lineHeight: 16,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },

  actionCard: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '42%',
    minHeight: 125,
    padding: 14,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  alertBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },

  alertBadgeText: {
    color: '#B91C1C',
    fontSize: 10,
    fontWeight: '700',
  },

  redListCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 14,
    marginBottom: 26,
  },

  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },

  alertIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  alertContent: {
    flex: 1,
  },

  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
  },

  alertSubtitle: {
    fontSize: 11,
    marginTop: 5,
  },

  divider: {
    height: 1,
    marginLeft: 55,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 13,
    borderRadius: 12,
    marginTop: 8,
  },

  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
  },

  subscriptionCard: {
    padding: 19,
    borderRadius: 21,
    marginBottom: 24,
  },

  subscriptionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 20,
  },

  subscriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  subscriptionText: {
    flex: 1,
  },

  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  subscriptionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#E0EDE3',
    marginTop: 6,
  },

  subscriptionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
  },

  subscriptionButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 2,
  },
});