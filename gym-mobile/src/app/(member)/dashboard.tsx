
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  StatusBar,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';

export default function MemberDashboard() {
  const { theme, themeMode } = useAppTheme();

  const stats = [
    { label: 'Attendance', value: '12', icon: '📅' },
    { label: 'Workouts', value: '08', icon: '💪' },
    { label: 'Day Streak', value: '05', icon: '🔥' },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.brand, { color: theme.primary }]}>
              GYMSYNC
            </Text>
            <Text style={[styles.greeting, { color: theme.text }]}>
              Hello, Arpita! 👋
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              Ready for today's workout?
            </Text>
          </View>

         <Pressable
  style={[
    styles.notificationButton,
    {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
  ]}
  // onPress={() => router.push('/settings/notifications')}
  accessibilityLabel="Notifications"
>
  <Ionicons
    name="notifications-outline"
    size={24}
    color={theme.text}
  />
  <View style={styles.notificationDot} />
</Pressable>

          <Pressable
            style={[
              styles.profile,
              { backgroundColor: theme.inputBackground },
            ]}
            onPress={() => router.push('/(member)/membership')}
          >
            <Text style={[styles.profileText, { color: theme.primary }]}>
              A
            </Text>
          </Pressable>
        </View>

        {/* Membership badge */}
        <View
          style={[
            styles.membershipBadge,
            { backgroundColor: theme.inputBackground },
          ]}
        >
          <Text style={{ fontSize: 20 }}>🏆</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.badgeTitle, { color: theme.text }]}>
              Active Member
            </Text>
            <Text style={[styles.badgeSubtitle, { color: theme.secondaryText }]}>
              Keep showing up. Keep growing.
            </Text>
          </View>
          <Text style={[styles.badgeArrow, { color: theme.primary }]}>→</Text>
        </View>

        {/* QR Scan Card */}
        <View style={[styles.scanCard, { backgroundColor: theme.primary }]}>
          <View style={styles.scanTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scanLabel}>DAILY ATTENDANCE</Text>
              <Text style={styles.scanTitle}>Scan & Check In</Text>
              <Text style={styles.scanDescription}>
                Scan your gym's QR code to mark attendance.
              </Text>
            </View>

            <Text style={styles.scanEmoji}>📷</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.scanButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push('/(member)/scan')}
          >
            <Text style={[styles.scanButtonText, { color: theme.primary }]}>
              ▦   Scan QR Code
            </Text>
          </Pressable>
        </View>

        {/* Quick actions */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Access
        </Text>

        <View style={styles.quickActions}>
          <Pressable
            style={[styles.quickCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push('/(member)/attendance' as any)}
          >
            <Text style={styles.quickIcon}>📅</Text>
            <Text style={[styles.quickTitle, { color: theme.text }]}>
              Attendance
            </Text>
          </Pressable>

          <Pressable
            style={[styles.quickCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push('/(member)/diet-plan')}
          >
            <Text style={styles.quickIcon}>🥗</Text>
            <Text style={[styles.quickTitle, { color: theme.text }]}>
              Diet Plan
            </Text>
          </Pressable>

          <Pressable
            style={[styles.quickCard, { backgroundColor: theme.card, borderColor: theme.border }]}
           onPress={() => router.push('/(member)/membership')}
          >
            <Text style={styles.quickIcon}>💳</Text>
            <Text style={[styles.quickTitle, { color: theme.text }]}>
              Membership
            </Text>
          </Pressable>
        </View>

        {/* Statistics */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Your Activity
        </Text>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={[
                styles.statCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.note, { color: theme.secondaryText }]}>
          Your fitness journey starts with one step. 💚
        </Text>
      </ScrollView>

      {/* Bottom Navigation */}
     
    </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brand: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 25,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
  },
  profile: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 18,
    fontWeight: '800',
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    marginBottom: 22,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  badgeArrow: {
    fontSize: 24,
    fontWeight: '600',
  },
  scanCard: {
    padding: 20,
    borderRadius: 22,
    marginBottom: 26,
  },
  scanTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scanLabel: {
    color: '#E0EDE3',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  scanTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    marginBottom: 8,
  },
  scanDescription: {
    color: '#E0EDE3',
    fontSize: 13,
    lineHeight: 20,
  },
  scanEmoji: {
    fontSize: 38,
    marginLeft: 10,
  },
  scanButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },
  quickCard: {
    flex: 1,
    minHeight: 112,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickIcon: {
    fontSize: 25,
    marginBottom: 10,
  },
  quickTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 21,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 23,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navIcon: {
    fontSize: 22,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  centerNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  centerScanButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  centerScanIcon: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },

  headerRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},


notificationButton: {
  width: 44,
  height: 44,
  borderRadius: 24,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  marginLeft:80,
  
},


notificationDot: {
  position: 'absolute',
  top: 8,
  right: 9,
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#EF4444',
  borderWidth: 1,
  borderColor: '#FFFFFF',
},
});



