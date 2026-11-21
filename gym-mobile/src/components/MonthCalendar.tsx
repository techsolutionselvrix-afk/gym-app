import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';

export type MarkedDate = {
  date: string; // YYYY-MM-DD
  dot: 'gym' | 'public';
  title?: string;
};

type Props = {
  year: number;
  month: number; // 1-12
  marks: MarkedDate[];
  selected?: string | null; // YYYY-MM-DD
  onSelect?: (iso: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

export default function MonthCalendar({ year, month, marks, selected, onSelect, onPrev, onNext }: Props) {
  const { theme } = useAppTheme();

  const grid = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startWeekday = first.getDay(); // 0 Sun ... 6 Sat
    const cells: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const marksByDay = useMemo(() => {
    const m = new Map<string, MarkedDate[]>();
    for (const mk of marks) {
      const arr = m.get(mk.date) ?? [];
      arr.push(mk);
      m.set(mk.date, arr);
    }
    return m;
  }, [marks]);

  const todayIso = isoOf(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());

  return (
    <View style={[styles.wrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Pressable onPress={onPrev} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>
          {MONTHS[month - 1]} {year}
        </Text>
        <Pressable onPress={onNext} hitSlop={10}>
          <Ionicons name="chevron-forward" size={22} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEK.map((w, i) => (
          <Text key={i} style={[styles.weekCell, { color: theme.secondaryText }]}>{w}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((d, i) => {
          if (d == null) return <View key={i} style={styles.cell} />;
          const iso = isoOf(year, month, d);
          const isToday = iso === todayIso;
          const isSel = selected === iso;
          const dayMarks = marksByDay.get(iso) ?? [];
          const hasGym = dayMarks.some((x) => x.dot === 'gym');
          const hasPublic = dayMarks.some((x) => x.dot === 'public');
          return (
            <Pressable
              key={i}
              onPress={() => onSelect?.(iso)}
              style={[
                styles.cell,
                isSel && { backgroundColor: theme.primary, borderRadius: 10 },
                isToday && !isSel && { borderWidth: 1, borderColor: theme.primary, borderRadius: 10 },
              ]}
            >
              <Text style={{
                color: isSel ? theme.background : theme.text,
                fontWeight: isToday ? '800' : '500',
                fontSize: 13,
              }}>
                {d}
              </Text>
              <View style={styles.dotsRow}>
                {hasGym && <View style={[styles.dot, { backgroundColor: isSel ? theme.background : '#DC4545' }]} />}
                {hasPublic && <View style={[styles.dot, { backgroundColor: isSel ? theme.background : '#2563EB' }]} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#DC4545' }]} />
          <Text style={{ color: theme.secondaryText, fontSize: 11 }}>Gym closure</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#2563EB' }]} />
          <Text style={{ color: theme.secondaryText, fontSize: 11 }}>Public holiday</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, borderWidth: 1, padding: 14, marginHorizontal: 20, marginBottom: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: { fontSize: 15, fontWeight: '800' },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekCell: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  dotsRow: { flexDirection: 'row', gap: 3, marginTop: 2, height: 5 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 10, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
