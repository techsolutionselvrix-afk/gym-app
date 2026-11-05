import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { Api, ApiError, Plan, Profile } from '@/lib/api';

const durationLabel = (days: number) =>
  days === 30 ? '1 Month' : days === 90 ? '3 Months' : days === 180 ? '6 Months' : days === 365 ? '12 Months' : `${days} days`;
const priceStr = (p: Plan) => {
  const sym = p.currency === 'INR' ? '₹' : (p.currency ?? '') + ' ';
  return `${sym}${(p.price_cents / 100).toLocaleString()}`;
};

const DURATIONS: { label: string; days: number }[] = [
  { label: 'Monthly', days: 30 },
  { label: 'Quarterly', days: 90 },
  { label: 'Half-Yearly', days: 180 },
  { label: 'Yearly', days: 365 },
];

export default function OwnerPlansScreen() {
  const { theme } = useAppTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [days, setDays] = useState<number>(30);

  const load = useCallback(async () => {
    setLoading(true);
    const me = await Api.me().catch(() => null);
    setProfile(me);
    if (me?.gym_id) {
      const rows = await Api.listPlans(me.gym_id).catch(() => [] as Plan[]);
      setPlans(rows ?? []);
    } else {
      setPlans([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addPlan = async () => {
    if (!profile?.gym_id) return Alert.alert('No gym', 'Your account has no gym attached yet.');
    if (!name.trim() || !price.trim()) {
      return Alert.alert('Missing details', 'Enter a name and price.');
    }
    const amount = Number(price);
    if (!isFinite(amount) || amount <= 0) {
      return Alert.alert('Invalid price', 'Enter a positive number.');
    }
    setSaving(true);
    try {
      const created = await Api.createPlan({
        gym_id: profile.gym_id,
        name: name.trim(),
        price_cents: Math.round(amount * 100),
        duration_days: days,
        currency: 'INR',
        active: true,
      } as any);
      setPlans((prev) => [...prev, created]);
      setName(''); setPrice(''); setDays(30);
      setModalOpen(false);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      Alert.alert('Could not add plan', msg || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p: Plan) => {
    try {
      const updated = await Api.updatePlan(p.id, { active: !p.active } as any);
      setPlans((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      Alert.alert('Could not update plan', msg || 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Membership Plans</Text>
        <Pressable
          onPress={() => setModalOpen(true)}
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add" size={18} color={theme.background} />
          <Text style={{ color: theme.background, fontWeight: '800', fontSize: 13 }}>New</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.hint, { color: theme.secondaryText }]}>
          Add regular plans (Monthly, Yearly) or festive offers (Diwali discount, New Year special).
          Members see only plans you mark as active.
        </Text>

        {loading && <ActivityIndicator color={theme.primary} style={{ marginTop: 30 }} />}

        {!loading && plans.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="pricetags-outline" size={44} color={theme.secondaryText} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No plans yet</Text>
            <Text style={[styles.emptySub, { color: theme.secondaryText }]}>
              Tap "New" to create your first plan.
            </Text>
          </View>
        )}

        {plans.map((p) => (
          <View
            key={p.id}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, opacity: p.active ? 1 : 0.6 }]}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: theme.text, fontWeight: '800', fontSize: 16 }}>{p.name}</Text>
              <Text style={{ color: theme.secondaryText, fontSize: 12 }}>{durationLabel(p.duration_days)}</Text>
              <Text style={{ color: theme.text, fontWeight: '700', marginTop: 4 }}>{priceStr(p)}</Text>
            </View>
            <Pressable
              onPress={() => toggle(p)}
              style={[
                styles.toggleBtn,
                { backgroundColor: p.active ? 'rgba(220,60,60,0.12)' : 'rgba(60,180,110,0.12)', borderColor: p.active ? '#DC4545' : '#16A34A' },
              ]}
            >
              <Text style={{ color: p.active ? '#DC4545' : '#16A34A', fontSize: 12, fontWeight: '800' }}>
                {p.active ? 'Pause' : 'Activate'}
              </Text>
            </Pressable>
          </View>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Plan</Text>

            <Text style={[styles.label, { color: theme.text }]}>Plan name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Diwali Special"
              placeholderTextColor={theme.secondaryText}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>Price (₹)</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="999"
              placeholderTextColor={theme.secondaryText}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>Duration</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {DURATIONS.map((d) => {
                const on = days === d.days;
                return (
                  <Pressable
                    key={d.days}
                    onPress={() => setDays(d.days)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
                      backgroundColor: on ? theme.primary : theme.card,
                      borderColor: on ? theme.primary : theme.border,
                    }}
                  >
                    <Text style={{ color: on ? theme.background : theme.text, fontSize: 12, fontWeight: '700' }}>
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Pressable
                onPress={() => setModalOpen(false)}
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={addPlan}
                disabled={saving}
                style={[styles.btn, { backgroundColor: theme.primary, opacity: saving ? 0.6 : 1 }]}
              >
                <Text style={{ color: theme.background, fontWeight: '800' }}>
                  {saving ? 'Saving…' : 'Create Plan'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  hint: { fontSize: 12, lineHeight: 18, marginHorizontal: 20, marginBottom: 16 },
  emptyCard: {
    marginHorizontal: 20, padding: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptySub: { fontSize: 12, textAlign: 'center', marginTop: 6 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, marginBottom: 10, padding: 14, borderWidth: 1, borderRadius: 12,
  },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 22,
  },
  modalCard: { borderRadius: 18, borderWidth: 1, padding: 22 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  input: {
    height: 44, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14,
  },
  btn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 11,
  },
});
