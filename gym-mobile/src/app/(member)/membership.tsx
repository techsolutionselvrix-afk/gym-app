
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { Api, Plan, Profile } from '@/lib/api';

const priceStr = (p: Plan) => {
  const amount = (p.price_cents / 100).toLocaleString();
  const sym = p.currency === 'INR' ? '₹' : p.currency + ' ';
  return `${sym}${amount}`;
};
const durationLabel = (days: number) =>
  days === 30 ? '1 Month' : days === 90 ? '3 Months' : days === 365 ? '12 Months' : `${days} days`;
const perLabel = (days: number) =>
  days === 30 ? 'per month' : days === 90 ? 'for 3 months' : days === 365 ? 'per year' : '';

export default function MembershipScreen() {
  const { theme, themeMode } = useAppTheme();
  const styles = createStyles(theme);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([Api.me().catch(() => null), Api.listPlans().catch(() => [])])
      .then(([p, pl]) => {
        if (!active) return;
        if (p) setProfile(p);
        setPlans(pl ?? []);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.heading}>Membership</Text>
            <Text style={styles.subtitle}>Your fitness journey, your plan</Text>
          </View>
        </View>

        {/* Current Membership */}
        <View style={styles.activeCard}>
          <View style={styles.activeTop}>
            <View>
              <Text style={styles.activeLabel}>ACCOUNT</Text>
              <Text style={styles.activePlan}>{profile?.full_name || 'Member'}</Text>
            </View>
            {profile && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.validityRow}>
            <View>
              <Text style={styles.detailLabel}>Member since</Text>
              <Text style={styles.detailValue}>{memberSince}</Text>
            </View>
            <View>
              <Text style={styles.detailLabel}>Plan</Text>
              <Text style={styles.detailValue}>
                {profile?.gym_id ? 'Assigned' : 'Not assigned yet'}
              </Text>
            </View>
          </View>
        </View>

        {/* Benefits */}
        <Text style={styles.sectionTitle}>Your Benefits</Text>

        <View style={styles.benefitsCard}>
          {[
            ['✓', 'Unlimited gym access'],
            ['✓', 'Personalized workout plans'],
            ['✓', 'Diet plan guidance'],
            ['✓', 'Attendance tracking'],
          ].map(([icon, label]) => (
            <View style={styles.benefitRow} key={label}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkText}>{icon}</Text>
              </View>
              <Text style={styles.benefitText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plansHeader}>
          <Text style={styles.sectionTitle}>Explore Plans</Text>
          <Text style={styles.plansCaption}>Choose your duration</Text>
        </View>

        {loading && <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />}
        {!loading && plans.length === 0 && (
          <Text style={{ color: theme.secondaryText, textAlign: 'center', marginTop: 20 }}>
            No plans available yet.
          </Text>
        )}
        {plans.map((plan) => (
          <View key={plan.id} style={styles.planCard}>
            <View style={styles.planInfo}>
              <View style={styles.planNameRow}>
                <Text style={styles.planName}>{plan.name}</Text>
              </View>

              <Text style={styles.planDuration}>{durationLabel(plan.duration_days)}</Text>
              <Text style={styles.planDescription}>
                {plan.active ? 'Available now' : 'Currently paused'}
              </Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.planPrice}>{priceStr(plan)}</Text>
              <Text style={styles.perMonth}>{perLabel(plan.duration_days)}</Text>
            </View>
          </View>
        ))}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Need help with your plan?</Text>
          <Text style={styles.noteText}>
            Contact your gym owner for membership renewals, upgrades, and
            payment details.
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          Sample plans and prices for demonstration only.
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
      gap: 14,
      marginBottom: 25,
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
      lineHeight: 36,
      color: theme.text,
      marginTop: -4,
    },
    heading: {
      fontSize: 25,
      fontWeight: '800',
      color: theme.text,
    },
    subtitle: {
      fontSize: 12,
      color: theme.secondaryText,
      marginTop: 4,
    },
    activeCard: {
      backgroundColor: theme.primary,
      borderRadius: 23,
      padding: 21,
      marginBottom: 28,
    },
    activeTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10,
    },
    activeLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.1,
      color: '#FFFFFF',
      opacity: 0.8,
    },
    activePlan: {
      fontSize: 25,
      fontWeight: '800',
      color: '#FFFFFF',
      marginTop: 9,
    },
    activeBadge: {
      backgroundColor: '#D7E9D9',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    },
    activeBadgeText: {
      color: '#315F4B',
      fontSize: 10,
      fontWeight: '800',
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.25)',
      marginVertical: 21,
    },
    validityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    detailLabel: {
      color: '#FFFFFF',
      opacity: 0.8,
      fontSize: 11,
      marginBottom: 6,
    },
    detailValue: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    progressBackground: {
      height: 6,
      backgroundColor: 'rgba(255,255,255,0.25)',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 23,
    },
    progressFill: {
      width: '85%',
      height: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
    },
    remainingText: {
      color: '#FFFFFF',
      opacity: 0.8,
      fontSize: 10,
      marginTop: 10,
      lineHeight: 15,
    },
    sectionTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: theme.text,
    },
    benefitsCard: {
      backgroundColor: theme.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 17,
      marginTop: 14,
      marginBottom: 28,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
      gap: 12,
    },
    checkCircle: {
      width: 25,
      height: 25,
      borderRadius: 13,
      backgroundColor: theme.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkText: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: '800',
    },
    benefitText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '500',
      flex: 1,
    },
    plansHeader: {
      marginBottom: 14,
    },
    plansCaption: {
      color: theme.secondaryText,
      fontSize: 12,
      marginTop: 5,
    },
    planCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      gap: 10,
    },
    popularPlan: {
      borderColor: theme.primary,
      borderWidth: 2,
    },
    planInfo: {
      flex: 1,
    },
    planNameRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
    planName: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text,
    },
    popularBadge: {
      backgroundColor: theme.inputBackground,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 6,
    },
    popularBadgeText: {
      color: theme.primary,
      fontSize: 8,
      fontWeight: '800',
    },
    planDuration: {
      color: theme.secondaryText,
      fontSize: 11,
      marginTop: 5,
    },
    planDescription: {
      color: theme.secondaryText,
      fontSize: 10,
      marginTop: 5,
      lineHeight: 15,
    },
    priceContainer: {
      alignItems: 'flex-end',
    },
    planPrice: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.primary,
    },
    perMonth: {
      fontSize: 10,
      color: theme.secondaryText,
      marginTop: 4,
    },
    noteCard: {
      padding: 17,
      backgroundColor: theme.inputBackground,
      borderRadius: 17,
      marginTop: 12,
    },
    noteTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 7,
    },
    noteText: {
      color: theme.secondaryText,
      fontSize: 12,
      lineHeight: 19,
    },
    disclaimer: {
      color: theme.secondaryText,
      fontSize: 10,
      textAlign: 'center',
      marginTop: 18,
    },
  });
}

