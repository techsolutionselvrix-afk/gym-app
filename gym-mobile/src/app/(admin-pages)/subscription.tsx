import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { Api, ApiError, AppSubscription, AppSubscriptionPlan } from '@/lib/api';

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function AppSubscriptionScreen() {
  const { theme } = useAppTheme();
  const [sub, setSub] = useState<AppSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Api.getMyAppSubscription();
      setSub(data);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      Alert.alert('Could not load subscription', msg || 'Try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const renew = async (plan: AppSubscriptionPlan) => {
    setRenewingId(plan.id);
    try {
      const data = await Api.renewMyAppSubscription(plan.id);
      setSub(data);
      Alert.alert(
        'Subscription renewed',
        `Your GymSync access is now valid until ${fmtDate(data.ends_at)}.`,
      );
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      Alert.alert('Could not renew', msg || 'Try again.');
    } finally {
      setRenewingId(null);
    }
  };

  const daysLeft = sub?.days_remaining ?? 0;
  const urgent = daysLeft <= 7;
  const expired = daysLeft <= 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>App Subscription</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />}

        {!loading && sub && (
          <>
            <View
              style={[
                styles.statusCard,
                {
                  backgroundColor: expired ? '#FEE2E2' : urgent ? '#FEF3C7' : theme.card,
                  borderColor: expired ? '#DC4545' : urgent ? '#B45309' : theme.border,
                },
              ]}
            >
              <View style={styles.statusTop}>
                <Ionicons
                  name={expired ? 'alert-circle' : urgent ? 'warning' : 'checkmark-circle'}
                  size={28}
                  color={expired ? '#DC4545' : urgent ? '#B45309' : '#16A34A'}
                />
                <Text
                  style={[
                    styles.statusLabel,
                    { color: expired ? '#DC4545' : urgent ? '#B45309' : '#16A34A' },
                  ]}
                >
                  {expired ? 'Subscription expired' : urgent ? 'Renew soon' : 'Subscription active'}
                </Text>
              </View>

              <Text style={[styles.daysValue, { color: theme.text }]}>
                {daysLeft} <Text style={styles.daysUnit}>days left</Text>
              </Text>
              <Text style={[styles.subLine, { color: theme.secondaryText }]}>
                Valid until {fmtDate(sub.ends_at)}
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Renew / Extend</Text>
            <Text style={[styles.hint, { color: theme.secondaryText }]}>
              Extending early stacks on top of your remaining days — you never lose unused time.
            </Text>

            {sub.plans.map((plan) => {
              const busy = renewingId === plan.id;
              return (
                <View
                  key={plan.id}
                  style={[styles.planCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: theme.text, fontWeight: '800', fontSize: 16 }}>{plan.name}</Text>
                    <Text style={{ color: theme.secondaryText, fontSize: 12 }}>
                      {plan.days} days of GymSync access
                    </Text>
                    <Text style={{ color: theme.text, fontWeight: '700', marginTop: 4 }}>
                      ₹{plan.price_inr.toLocaleString()}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => renew(plan)}
                    disabled={busy}
                    style={[styles.renewBtn, { backgroundColor: theme.primary, opacity: busy ? 0.6 : 1 }]}
                  >
                    <Text style={{ color: theme.background, fontWeight: '800', fontSize: 13 }}>
                      {busy ? '…' : 'Renew'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}

            <View style={{ height: 30 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14,
  },
  title: { fontSize: 18, fontWeight: '800' },
  statusCard: {
    marginHorizontal: 20, padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 20,
  },
  statusTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  statusLabel: { fontSize: 13, fontWeight: '800' },
  daysValue: { fontSize: 38, fontWeight: '900' },
  daysUnit: { fontSize: 14, fontWeight: '600' },
  subLine: { fontSize: 12, marginTop: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginHorizontal: 20, marginBottom: 6 },
  hint: { fontSize: 12, lineHeight: 18, marginHorizontal: 20, marginBottom: 14 },
  planCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, marginBottom: 10, padding: 14, borderWidth: 1, borderRadius: 12,
  },
  renewBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
});
