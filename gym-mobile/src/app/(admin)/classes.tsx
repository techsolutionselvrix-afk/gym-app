import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Api, ApiError, GymClass } from '@/lib/api';

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

const toIso = (date: string, time: string) => {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  if (!y || !m || !d || hh == null || mm == null) return null;
  const dt = new Date(y, m - 1, d, hh, mm);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString();
};

export default function ClassesScreen() {
  const { theme } = useAppTheme();
  const [items, setItems] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('20');

  const load = useCallback(() => {
    setLoading(true);
    Api.listClasses()
      .then((rows) => setItems(rows ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const addClass = async () => {
    if (!name.trim() || !date || !startTime || !endTime) {
      return Alert.alert('Missing details', 'Enter name, date, start and end time.');
    }
    const startIso = toIso(date, startTime);
    const endIso = toIso(date, endTime);
    if (!startIso || !endIso) {
      return Alert.alert('Invalid date/time', 'Use YYYY-MM-DD and HH:MM (24h).');
    }
    const cap = Number(capacity);
    if (!Number.isInteger(cap) || cap < 1) {
      return Alert.alert('Invalid capacity', 'Enter a whole number ≥ 1.');
    }
    setSaving(true);
    try {
      const created = await Api.createClass({
        name: name.trim(),
        start_time: startIso,
        end_time: endIso,
        capacity: cap,
      });
      setItems((prev) => [created, ...prev]);
      setName(''); setDate(''); setStartTime(''); setEndTime(''); setCapacity('20');
      setModalOpen(false);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      Alert.alert('Could not add class', msg || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const remove = (c: GymClass) => {
    Alert.alert('Remove class?', c.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await Api.deleteClass(c.id);
            setItems((prev) => prev.filter((x) => x.id !== c.id));
          } catch (e) {
            const msg = e instanceof ApiError ? e.message : (e as Error).message;
            Alert.alert('Could not delete', msg || 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Classes</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Manage your gym classes</Text>
          </View>
          <Pressable
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setModalOpen(true)}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Ionicons name="fitness-outline" size={22} color={theme.primary} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{items.length}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Total Classes</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Ionicons name="people-outline" size={22} color={theme.primary} />
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {items.reduce((sum, c) => sum + (c.capacity || 0), 0)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Total Capacity</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>All Classes</Text>

        {loading && <ActivityIndicator color={theme.primary} style={{ marginTop: 30 }} />}

        {!loading && items.length === 0 && (
          <View style={{
            padding: 24, borderRadius: 14, borderWidth: 1,
            borderColor: theme.border, backgroundColor: theme.card, alignItems: 'center',
          }}>
            <Ionicons name="calendar-outline" size={36} color={theme.secondaryText} />
            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15, marginTop: 10 }}>
              No classes yet
            </Text>
            <Text style={{ color: theme.secondaryText, fontSize: 12, textAlign: 'center', marginTop: 6 }}>
              Tap Add to schedule your first class.
            </Text>
          </View>
        )}

        {items.map((c) => (
          <View
            key={c.id}
            style={[styles.classCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.classTop}>
              <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                <Ionicons name="barbell-outline" size={22} color={theme.primary} />
              </View>
              <View style={styles.classInfo}>
                <Text style={[styles.className, { color: theme.text }]}>{c.name}</Text>
                <Text style={{ color: theme.secondaryText, fontSize: 12 }}>
                  {fmt(c.start_time)} → {fmt(c.end_time)}
                </Text>
              </View>
              <Pressable onPress={() => remove(c)} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color="#DC4545" />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.classBottom}>
              <View style={styles.detail}>
                <Ionicons name="people-outline" size={16} color={theme.secondaryText} />
                <Text style={[styles.detailText, { color: theme.secondaryText }]}>
                  Capacity: {c.capacity}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Class</Text>

            <Text style={[styles.label, { color: theme.text }]}>Class name</Text>
            <TextInput
              value={name} onChangeText={setName}
              placeholder="e.g. Morning Yoga"
              placeholderTextColor={theme.secondaryText}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>Date (YYYY-MM-DD)</Text>
            <TextInput
              value={date} onChangeText={setDate}
              placeholder="2026-11-20"
              placeholderTextColor={theme.secondaryText}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.text }]}>Start (HH:MM)</Text>
                <TextInput
                  value={startTime} onChangeText={setStartTime}
                  placeholder="07:00"
                  placeholderTextColor={theme.secondaryText}
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.text }]}>End (HH:MM)</Text>
                <TextInput
                  value={endTime} onChangeText={setEndTime}
                  placeholder="08:00"
                  placeholderTextColor={theme.secondaryText}
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Capacity</Text>
            <TextInput
              value={capacity} onChangeText={setCapacity}
              keyboardType="numeric"
              placeholder="20"
              placeholderTextColor={theme.secondaryText}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
              <Pressable
                onPress={() => setModalOpen(false)}
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={addClass}
                disabled={saving}
                style={[styles.btn, { backgroundColor: theme.primary, opacity: saving ? 0.6 : 1 }]}
              >
                <Text style={{ color: theme.background, fontWeight: '800' }}>
                  {saving ? 'Saving…' : 'Create Class'}
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
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 15, marginBottom: 25,
  },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginTop: 5 },
  addButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '600', marginLeft: 5 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, padding: 14, borderRadius: 13 },
  statNumber: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 11, marginTop: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  classCard: { padding: 14, borderRadius: 13, borderWidth: 1, marginBottom: 12 },
  classTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 42, height: 42, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  classInfo: { flex: 1 },
  className: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  divider: { height: 1, backgroundColor: '#88888830', marginVertical: 12 },
  classBottom: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { fontSize: 11 },
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
