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
import { Api, AppSubscription, MembershipRow } from '@/lib/api';

type Notice = {
  id: string;
  title: string;
  body: string;
  tone: 'info' | 'warn' | 'danger' | 'success';
  icon: 'alert-circle' | 'checkmark-circle' | 'time' | 'card' | 'notifications';
  route?: string;
};

const daysBetween = (iso: string) => {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

export default function NotificationsScreen() {
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [memsRes, subRes] = await Promise.allSettled([
      Api.listMemberships('active'),
      Api.getMyAppSubscription(),
    ]);
    const mems: MembershipRow[] =
      memsRes.status === 'fulfilled' ? memsRes.value ?? [] : [];
    const sub: AppSubscription | null =
      subRes.status === 'fulfilled' ? subRes.value : null;

    const out: Notice[] = [];

    if (sub) {
      if (sub.days_remaining <= 0) {
        out.push({
          id: 'app-sub-expired',
          title: 'Your GymSync subscription expired',
          body: 'Renew now to keep using the app.',
          tone: 'danger',
          icon: 'card',
          route: '/(admin-pages)/subscription',
        });
      } else if (sub.days_remaining <= 7) {
        out.push({
          id: 'app-sub-soon',
          title: `App subscription expiring in ${sub.days_remaining} days`,
          body: 'Renew early — unused days stack on top.',
          tone: 'warn',
          icon: 'card',
          route: '/(admin-pages)/subscription',
        });
      }
    }

    const today = new Date();
    for (const m of mems) {
      const left = daysBetween(m.end_date);
      const who = m.member_name || m.member_email || 'A member';
      if (left <= 0) {
        out.push({
          id: `exp-${m.id}`,
          title: `${who}'s membership expired`,
          body: m.plan_name ? `Plan: ${m.plan_name}` : 'Nudge them to renew.',
          tone: 'danger',
          icon: 'alert-circle',
          route: '/(admin-pages)/renewals',
        });
      } else if (left <= 7) {
        out.push({
          id: `soon-${m.id}`,
          title: `${who}'s membership expires in ${left} day${left === 1 ? '' : 's'}`,
          body: m.plan_name ? `Plan: ${m.plan_name}` : 'Expiring soon.',
          tone: 'warn',
          icon: 'time',
          route: '/(admin-pages)/renewals',
        });
      } else {
        const startedToday =
          new Date(m.start_date).toDateString() === today.toDateString();
        if (startedToday) {
          out.push({
            id: `new-${m.id}`,
            title: `${who} subscribed`,
            body: m.plan_name ? `Plan: ${m.plan_name}` : 'New subscription.',
            tone: 'success',
            icon: 'checkmark-circle',
            route: '/(admin-pages)/renewals',
          });
        }
      }
    }

    setNotices(out);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toneColor = (t: Notice['tone']) =>
    t === 'danger' ? '#DC4545' : t === 'warn' ? '#B45309' : t === 'success' ? '#16A34A' : theme.primary;

  const toneBg = (t: Notice['tone']) =>
    t === 'danger'
      ? 'rgba(220,69,69,0.10)'
      : t === 'warn'
      ? 'rgba(180,83,9,0.10)'
      : t === 'success'
      ? 'rgba(22,163,74,0.10)'
      : 'rgba(0,120,120,0.08)';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />}

        {!loading && notices.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="notifications-outline" size={44} color={theme.secondaryText} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>You're all caught up</Text>
            <Text style={[styles.emptySub, { color: theme.secondaryText }]}>
              Expiring memberships, new sign-ups, and subscription alerts will appear here.
            </Text>
          </View>
        )}

        {notices.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => n.route && router.push(n.route as any)}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: toneBg(n.tone) }]}>
              <Ionicons name={n.icon} size={22} color={toneColor(n.tone)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{n.title}</Text>
              <Text style={[styles.cardBody, { color: theme.secondaryText }]}>{n.body}</Text>
            </View>
            {n.route && (
              <Ionicons name="chevron-forward" size={18} color={theme.secondaryText} />
            )}
          </Pressable>
        ))}

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
  emptyCard: {
    marginHorizontal: 20, padding: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptySub: { fontSize: 12, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, marginBottom: 10, padding: 14, borderWidth: 1, borderRadius: 12,
  },
  iconWrap: {
    width: 42, height: 42, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardBody: { fontSize: 12, marginTop: 4, lineHeight: 17 },
});
