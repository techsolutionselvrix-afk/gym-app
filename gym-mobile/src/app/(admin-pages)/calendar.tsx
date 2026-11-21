import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  Api,
  ApiError,
  GymHoliday,
  PublicHoliday,
  fetchPublicHolidaysIN,
} from '@/lib/api';
import MonthCalendar, { MarkedDate } from '@/components/MonthCalendar';
import { showConfirm } from '@/components/ConfirmDialog';

const pad = (n: number) => String(n).padStart(2, '0');

export default function AdminCalendarScreen() {
  const { theme } = useAppTheme();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [gymHolidays, setGymHolidays] = useState<GymHoliday[]>([]);
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [hol, pub] = await Promise.all([
      Api.listHolidays(year).catch(() => [] as GymHoliday[]),
      fetchPublicHolidaysIN(year),
    ]);
    setGymHolidays(hol ?? []);
    setPublicHolidays(pub);
    setLoading(false);
  }, [year]);

  useEffect(() => { load(); }, [load]);

  const marks: MarkedDate[] = useMemo(() => [
    ...gymHolidays.map((h) => ({ date: h.date, dot: 'gym' as const, title: h.title })),
    ...publicHolidays.map((p) => ({ date: p.date, dot: 'public' as const, title: p.localName })),
  ], [gymHolidays, publicHolidays]);

  const dayItems = useMemo(() => {
    if (!selected) return { gym: [], pub: [] };
    return {
      gym: gymHolidays.filter((h) => h.date === selected),
      pub: publicHolidays.filter((p) => p.date === selected),
    };
  }, [selected, gymHolidays, publicHolidays]);

  const prev = () => {
    const d = new Date(year, month - 2, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth() + 1);
  };
  const next = () => {
    const d = new Date(year, month, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth() + 1);
  };

  const openAdd = (iso?: string) => {
    const seed = iso ?? selected ?? `${year}-${pad(month)}-${pad(today.getDate())}`;
    setNewDate(seed); setNewTitle(''); setNewDesc('');
    setModalOpen(true);
  };

  const saveHoliday = async () => {
    if (!newDate.trim() || !newTitle.trim()) {
      return Alert.alert('Missing details', 'Enter a date and title.');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate.trim())) {
      return Alert.alert('Invalid date', 'Use YYYY-MM-DD.');
    }
    setSaving(true);
    try {
      const created = await Api.createHoliday({
        date: newDate.trim(),
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
      });
      setGymHolidays((prev) => [...prev, created]);
      setModalOpen(false);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      Alert.alert('Could not add', msg || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const remove = (h: GymHoliday) => {
    showConfirm({
      title: 'Remove holiday?',
      message: `${h.title} on ${h.date} — members will no longer see this closure.`,
      confirmText: 'Remove',
      destructive: true,
      onConfirm: async () => {
        try {
          await Api.deleteHoliday(h.id);
          setGymHolidays((prev) => prev.filter((x) => x.id !== h.id));
        } catch (e) {
          const msg = e instanceof ApiError ? e.message : (e as Error).message;
          Alert.alert('Could not delete', msg || 'Please try again.');
        }
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Calendar</Text>
        <Pressable
          onPress={() => openAdd()}
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add" size={18} color={theme.background} />
          <Text style={{ color: theme.background, fontWeight: '800', fontSize: 13 }}>Holiday</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color={theme.primary} style={{ marginTop: 30 }} />}

        <MonthCalendar
          year={year}
          month={month}
          marks={marks}
          selected={selected}
          onSelect={(iso) => setSelected(iso === selected ? null : iso)}
          onPrev={prev}
          onNext={next}
        />

        {selected && (
          <View style={{ marginHorizontal: 20 }}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {selected}
            </Text>
            {dayItems.gym.length === 0 && dayItems.pub.length === 0 && (
              <Text style={{ color: theme.secondaryText, fontSize: 12, marginBottom: 10 }}>
                Nothing scheduled.
              </Text>
            )}
            {dayItems.gym.map((h) => (
              <View key={h.id} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.chip, { backgroundColor: 'rgba(220,69,69,0.12)' }]}>
                  <Text style={{ color: '#DC4545', fontSize: 10, fontWeight: '800' }}>GYM CLOSURE</Text>
                </View>
                <Text style={{ color: theme.text, fontWeight: '700', marginTop: 6 }}>{h.title}</Text>
                {h.description && (
                  <Text style={{ color: theme.secondaryText, fontSize: 12, marginTop: 4 }}>
                    {h.description}
                  </Text>
                )}
                <Pressable onPress={() => remove(h)} style={{ alignSelf: 'flex-end', marginTop: 8 }} hitSlop={10}>
                  <Text style={{ color: '#DC4545', fontSize: 12, fontWeight: '700' }}>Remove</Text>
                </Pressable>
              </View>
            ))}
            {dayItems.pub.map((p, i) => (
              <View key={`p-${i}`} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.chip, { backgroundColor: 'rgba(37,99,235,0.12)' }]}>
                  <Text style={{ color: '#2563EB', fontSize: 10, fontWeight: '800' }}>PUBLIC HOLIDAY</Text>
                </View>
                <Text style={{ color: theme.text, fontWeight: '700', marginTop: 6 }}>{p.localName}</Text>
                <Text style={{ color: theme.secondaryText, fontSize: 12, marginTop: 4 }}>{p.name}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text, marginHorizontal: 20, marginTop: 14 }]}>
          Upcoming gym closures
        </Text>
        <View style={{ marginHorizontal: 20 }}>
          {gymHolidays.filter((h) => h.date >= `${year}-${pad(month)}-01`).length === 0 && (
            <Text style={{ color: theme.secondaryText, fontSize: 12, marginBottom: 12 }}>
              None yet. Tap Holiday to add one.
            </Text>
          )}
          {gymHolidays
            .filter((h) => h.date >= `${year}-${pad(month)}-01`)
            .slice(0, 10)
            .map((h) => (
              <Pressable
                key={h.id}
                onPress={() => setSelected(h.date)}
                style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>{h.title}</Text>
                <Text style={{ color: theme.secondaryText, fontSize: 12, marginTop: 4 }}>{h.date}</Text>
              </Pressable>
            ))}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Gym Holiday</Text>

            <Text style={[styles.label, { color: theme.text }]}>Date (YYYY-MM-DD)</Text>
            <TextInput
              value={newDate} onChangeText={setNewDate}
              placeholder="2026-12-25"
              placeholderTextColor={theme.secondaryText}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>Title</Text>
            <TextInput
              value={newTitle} onChangeText={setNewTitle}
              placeholder="e.g. Maintenance day"
              placeholderTextColor={theme.secondaryText}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>Note (optional)</Text>
            <TextInput
              value={newDesc} onChangeText={setNewDesc}
              placeholder="Gym will be closed all day."
              placeholderTextColor={theme.secondaryText}
              multiline
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground, height: 70, paddingTop: 10 }]}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
              <Pressable
                onPress={() => setModalOpen(false)}
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={saveHoliday}
                disabled={saving}
                style={[styles.btn, { backgroundColor: theme.primary, opacity: saving ? 0.6 : 1 }]}
              >
                <Text style={{ color: theme.background, fontWeight: '800' }}>
                  {saving ? 'Saving…' : 'Add Holiday'}
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
  sectionTitle: { fontSize: 14, fontWeight: '800', marginVertical: 10 },
  row: {
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10,
  },
  chip: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7,
  },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 22,
  },
  modalCard: { borderRadius: 18, borderWidth: 1, padding: 22 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  input: {
    height: 44, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14,
  },
  btn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 11,
  },
});
