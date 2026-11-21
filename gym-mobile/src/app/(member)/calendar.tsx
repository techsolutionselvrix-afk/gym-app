import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  Api,
  GymHoliday,
  PublicHoliday,
  fetchPublicHolidaysIN,
} from '@/lib/api';
import MonthCalendar, { MarkedDate } from '@/components/MonthCalendar';

export default function MemberCalendarScreen() {
  const { theme } = useAppTheme();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [gymHolidays, setGymHolidays] = useState<GymHoliday[]>([]);
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

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
    ...gymHolidays.map((h) => ({ date: h.date, dot: 'gym' as const })),
    ...publicHolidays.map((p) => ({ date: p.date, dot: 'public' as const })),
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Calendar</Text>
        <View style={{ width: 28 }} />
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
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{selected}</Text>
            {dayItems.gym.length === 0 && dayItems.pub.length === 0 && (
              <Text style={{ color: theme.secondaryText, fontSize: 12, marginBottom: 10 }}>
                No events this day.
              </Text>
            )}
            {dayItems.gym.map((h) => (
              <View key={h.id} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.chip, { backgroundColor: 'rgba(220,69,69,0.12)' }]}>
                  <Text style={{ color: '#DC4545', fontSize: 10, fontWeight: '800' }}>GYM CLOSED</Text>
                </View>
                <Text style={{ color: theme.text, fontWeight: '700', marginTop: 6 }}>{h.title}</Text>
                {h.description && (
                  <Text style={{ color: theme.secondaryText, fontSize: 12, marginTop: 4 }}>
                    {h.description}
                  </Text>
                )}
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
          {gymHolidays.length === 0 && (
            <Text style={{ color: theme.secondaryText, fontSize: 12, marginBottom: 12 }}>
              No closures scheduled.
            </Text>
          )}
          {gymHolidays.slice(0, 10).map((h) => (
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
  sectionTitle: { fontSize: 14, fontWeight: '800', marginVertical: 10 },
  row: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
});
