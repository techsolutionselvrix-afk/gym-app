
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { Api, ApiError, MembershipRow, Plan, Profile } from '@/lib/api';

const priceStr = (p: Plan) => {
  const amount = (p.price_cents / 100).toLocaleString();
  const sym = p.currency === 'INR' ? '₹' : p.currency + ' ';
  return `${sym}${amount}`;
};
const durationLabel = (days: number) =>
  days === 30 ? '1 Month' : days === 90 ? '3 Months' : days === 365 ? '12 Months' : `${days} days`;
const perLabel = (days: number) =>
  days === 30 ? 'per month' : days === 90 ? 'for 3 months' : days === 365 ? 'per year' : '';

const daysBetween = (end: string) => {
  const ms = new Date(end + 'T23:59:59').getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
};
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

export default function MembershipScreen() {
  const { theme, themeMode } = useAppTheme();
  const styles = createStyles(theme);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, pl, ms] = await Promise.all([
      Api.me().catch(() => null),
      Api.listPlans().catch(() => [] as Plan[]),
      Api.myMemberships().catch(() => [] as MembershipRow[]),
    ]);
    if (p) setProfile(p);
    setPlans(pl ?? []);
    setMemberships(ms ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = memberships.find((m) => m.status === 'active');
  const daysLeft = active ? daysBetween(active.end_date) : null;
  const renewSoon = daysLeft !== null && daysLeft <= 10;

  const subscribe = async (plan: Plan) => {
    setSubscribingId(plan.id);
    try {
      await Api.subscribe(plan.id);
      Alert.alert(
        active ? 'Membership renewed' : 'Subscribed',
        active
          ? `Your plan is extended by ${durationLabel(plan.duration_days)}.`
          : `Welcome! Your ${plan.name} plan starts today.`,
      );
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      Alert.alert('Could not subscribe', msg || 'Please try again.');
    } finally {
      setSubscribingId(null);
    }
  };

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
            <View style={{ flex: 1 }}>
              <Text style={styles.activeLabel}>CURRENT MEMBERSHIP</Text>
              <Text style={styles.activePlan}>
                {active?.plan_name || (profile?.gym_id ? 'No active plan' : 'No gym assigned')}
              </Text>
            </View>
            <View style={[styles.activeBadge, !active && { backgroundColor: 'rgba(220,60,60,0.12)' }]}>
              <Text style={[styles.activeBadgeText, !active && { color: '#DC4545' }]}>
                {active ? (renewSoon ? 'RENEW SOON' : 'ACTIVE') : 'INACTIVE'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.validityRow}>
            {active ? (
              <>
                <View>
                  <Text style={styles.detailLabel}>Started</Text>
                  <Text style={styles.detailValue}>{fmtDate(active.start_date)}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Valid until</Text>
                  <Text style={styles.detailValue}>{fmtDate(active.end_date)}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Days left</Text>
                  <Text style={[styles.detailValue, renewSoon && { color: '#DC4545' }]}>
                    {Math.max(0, daysLeft ?? 0)}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View>
                  <Text style={styles.detailLabel}>Member since</Text>
                  <Text style={styles.detailValue}>{memberSince}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailValue}>
                    {profile?.gym_id ? 'Pick a plan below' : 'Pick a plan below'}
                  </Text>
                </View>
              </>
            )}
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
          <Text style={styles.sectionTitle}>
            {active ? 'Renew or Switch Plan' : 'Available Plans'}
          </Text>
          <Text style={styles.plansCaption}>
            {active ? 'Renewals add days to your current plan' : 'Pick a duration to get started'}
          </Text>
        </View>

        {loading && <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />}
        {!loading && plans.length === 0 && (
          <Text style={{ color: theme.secondaryText, textAlign: 'center', marginTop: 20 }}>
            No plans available yet. Ask your gym owner to add plans.
          </Text>
        )}
        {plans.filter(p => p.active).map((plan) => {
          const subscribing = subscribingId === plan.id;
          return (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planInfo}>
                <View style={styles.planNameRow}>
                  <Text style={styles.planName}>{plan.name}</Text>
                </View>
                <Text style={styles.planDuration}>{durationLabel(plan.duration_days)}</Text>
                <Pressable
                  disabled={subscribing || !!subscribingId}
                  onPress={() => subscribe(plan)}
                  style={({ pressed }) => [
                    {
                      marginTop: 10,
                      backgroundColor: theme.primary,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      alignSelf: 'flex-start',
                      opacity: subscribing || (!!subscribingId && !subscribing) ? 0.6 : pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text style={{ color: theme.background, fontWeight: '800', fontSize: 13 }}>
                    {subscribing ? 'Processing…' : active ? 'Renew with this plan' : 'Subscribe'}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>{priceStr(plan)}</Text>
                <Text style={styles.perMonth}>{perLabel(plan.duration_days)}</Text>
              </View>
            </View>
          );
        })}

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

