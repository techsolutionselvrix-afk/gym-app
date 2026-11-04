import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { Api, Gym, Profile } from '@/lib/api';
import { signOutWithConfirm } from '@/lib/auth';

const prettyGender = (g?: string | null) => {
  if (!g) return '—';
  if (g === 'prefer_not_to_say') return 'Prefer not to say';
  return g.charAt(0).toUpperCase() + g.slice(1);
};

export default function AdminProfileScreen() {
  const { theme } = useAppTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);

  useEffect(() => {
    let active = true;
    Api.me().then((p) => {
      if (!active) return;
      setProfile(p);
      if (p.gym_id) Api.getGym(p.gym_id).then((g) => { if (active) setGym(g); }).catch(() => {});
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const name = profile?.full_name || 'Gym Owner';
  const initial = name.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.inputBackground }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{initial}</Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
          <Text style={[styles.email, { color: theme.secondaryText }]}>{profile?.email || '—'}</Text>

          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <Ionicons name="shield-checkmark" size={14} color={theme.background} />
            <Text style={[styles.badgeText, { color: theme.background }]}>Gym Owner</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal</Text>
        <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Row theme={theme} icon="call-outline" label="Phone" value={profile?.phone || '—'} />
          <Divider theme={theme} />
          <Row theme={theme} icon="person-outline" label="Gender" value={prettyGender(profile?.gender)} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Gym</Text>
        <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Row theme={theme} icon="business-outline" label="Name" value={gym?.name || (profile?.gym_id ? 'Loading…' : 'Not assigned')} />
          <Divider theme={theme} />
          <Row theme={theme} icon="location-outline" label="Address" value={gym?.address || '—'} />
          <Divider theme={theme} />
          <Row theme={theme} icon="mail-outline" label="Contact email" value={gym?.email || '—'} />
          <Divider theme={theme} />
          <Row theme={theme} icon="pulse-outline" label="Status" value={gym?.status ? gym.status.charAt(0).toUpperCase() + gym.status.slice(1) : '—'} />
        </View>

        <Pressable style={styles.logoutButton} onPress={signOutWithConfirm}>
          <Ionicons name="log-out-outline" size={21} color="#DC4545" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ theme, icon, label, value }: { theme: any; icon: any; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={theme.secondaryText} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: theme.secondaryText }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: theme.text }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

function Divider({ theme }: { theme: any }) {
  return <View style={{ height: 1, backgroundColor: theme.border, marginHorizontal: 16 }} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20,
  },
  title: { fontSize: 18, fontWeight: '800' },
  card: {
    marginHorizontal: 20, borderRadius: 18, borderWidth: 1,
    alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, marginBottom: 20,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800' },
  email: { fontSize: 13, marginTop: 4 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 14,
  },
  badgeText: { fontSize: 12, fontWeight: '800' },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginHorizontal: 20, marginBottom: 10 },
  detailCard: { marginHorizontal: 20, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
  rowLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  rowValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: 20, paddingVertical: 14,
    borderRadius: 12, borderWidth: 1, borderColor: '#DC4545',
  },
  logoutText: { color: '#DC4545', fontWeight: '700', fontSize: 15 },
});
