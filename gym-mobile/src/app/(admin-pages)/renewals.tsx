import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { Api, MembershipRow } from '@/lib/api';

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
const formatPrice = (r: MembershipRow) => {
  if (r.plan_price_cents == null) return '—';
  const sym = r.plan_currency === 'INR' ? '₹' : (r.plan_currency ?? '') + ' ';
  return `${sym}${(r.plan_price_cents / 100).toLocaleString()}`;
};

export default function RenewalsScreen() {
  const { theme } = useAppTheme();
  const [rows, setRows] = useState<MembershipRow[]>([]);
  const [tab, setTab] = useState<'active' | 'expired' | 'all'>('active');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (status: 'active' | 'expired' | 'all') => {
    setLoading(true);
    try {
      const data = await Api.listMemberships(status);
      setRows(data ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const counts = {
    active: rows.filter(r => r.status === 'active').length,
    total: rows.length,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Memberships</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statValue, { color: theme.text }]}>{counts.active}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Active now</Text>
          </View>
          <View style={{ width: 1, backgroundColor: theme.border, alignSelf: 'stretch', marginHorizontal: 16 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statValue, { color: theme.text }]}>{counts.total}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Shown</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          {(['active', 'expired', 'all'] as const).map((t) => {
            const on = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[
                  styles.tab,
                  { borderColor: on ? theme.primary : theme.border, backgroundColor: on ? theme.primary : theme.card },
                ]}
              >
                <Text style={{ color: on ? theme.background : theme.text, fontWeight: '700', fontSize: 13, textTransform: 'capitalize' }}>
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
        ) : rows.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="document-text-outline" size={44} color={theme.secondaryText} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No memberships</Text>
            <Text style={[styles.emptySubtitle, { color: theme.secondaryText }]}>
              When members subscribe or renew, they show up here.
            </Text>
          </View>
        ) : (
          rows.map((r) => (
            <View key={r.id} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>
                  {r.member_name || r.member_email || 'Unnamed member'}
                </Text>
                <Text style={{ color: theme.secondaryText, fontSize: 12 }}>
                  {r.plan_name ?? '—'} · {fmtDate(r.start_date)} → {fmtDate(r.end_date)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: theme.text, fontWeight: '800' }}>{formatPrice(r)}</Text>
                <View style={[
                  styles.chip,
                  r.status === 'active'
                    ? { backgroundColor: 'rgba(60,180,110,0.12)' }
                    : { backgroundColor: 'rgba(120,120,120,0.12)' },
                ]}>
                  <Text style={{
                    color: r.status === 'active' ? '#16A34A' : theme.secondaryText,
                    fontSize: 10, fontWeight: '800', textTransform: 'uppercase',
                  }}>
                    {r.status}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 30 }} />
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
  statsCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderRadius: 14, padding: 16,
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  tabRow: { flexDirection: 'row', gap: 8, marginHorizontal: 20, marginBottom: 14 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    marginHorizontal: 20, marginBottom: 10, borderRadius: 12, borderWidth: 1,
  },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  emptyCard: {
    marginHorizontal: 20, padding: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptySubtitle: { fontSize: 12, textAlign: 'center', marginTop: 6 },
});
