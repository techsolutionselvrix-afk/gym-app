import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Api, ApiError, Profile } from '@/lib/api';

export default function MembersScreen() {
  const { theme } = useAppTheme();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    Api.listMembers()
      .then((rows) => { if (active) { setMembers(rows); setError(null); } })
      .catch((e: any) => { if (active) setError(e?.message ?? 'Could not load members'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => { load(); }, [load]);

  const addMember = async () => {
    if (!name.trim() || !email.trim() || password.length < 8) {
      return Alert.alert('Missing details', 'Enter name, a valid email, and a password of at least 8 characters.');
    }
    setSaving(true);
    try {
      const created = await Api.createMember({
        email: email.trim(),
        password,
        full_name: name.trim(),
        phone: phone.trim() || undefined,
      });
      setMembers((prev) => [created, ...prev]);
      setName(''); setEmail(''); setPassword(''); setPhone('');
      setModalOpen(false);
      Alert.alert(
        'Member added',
        `A confirmation email was sent to ${created.email}. They can log in after confirming.`,
      );
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      Alert.alert('Could not add member', msg || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = search.trim()
    ? members.filter((m) => (m.full_name ?? '').toLowerCase().includes(search.toLowerCase()))
    : members;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Members</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              Manage your gym members
            </Text>
          </View>
          <Pressable
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setModalOpen(true)}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>

        <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={20} color={theme.secondaryText} />
          <TextInput
            placeholder="Search members..."
            placeholderTextColor={theme.secondaryText}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, marginLeft: 10, color: theme.text, fontSize: 14 }}
          />
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <Ionicons name="people-outline" size={28} color={theme.primary} />
          <View style={{ marginLeft: 15 }}>
            <Text style={[styles.count, { color: theme.text }]}>{members.length}</Text>
            <Text style={{ color: theme.secondaryText }}>Total Members</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>All Members</Text>
          <Text style={{ color: theme.secondaryText }}>{filtered.length} members</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 30 }} />
        ) : error ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="warning-outline" size={40} color="#DC4545" />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Could not load</Text>
            <Text style={[styles.emptySubtitle, { color: theme.secondaryText }]}>{error}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="people-outline" size={45} color={theme.secondaryText} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No members yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.secondaryText }]}>
              Tap Add to create your first member — they get an email to confirm their account.
            </Text>
          </View>
        ) : (
          filtered.map((m) => (
            <View
              key={m.id}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 14,
                padding: 14, borderRadius: 14, borderWidth: 1,
                borderColor: theme.border, backgroundColor: theme.card, marginBottom: 10,
              }}
            >
              <View style={{
                width: 42, height: 42, borderRadius: 21, backgroundColor: theme.inputBackground,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: theme.primary, fontWeight: '800' }}>
                  {(m.full_name || m.email || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>
                  {m.full_name || 'Unnamed'}
                </Text>
                <Text style={{ color: theme.secondaryText, fontSize: 12 }}>
                  {m.email ?? '—'}{m.phone ? ` · ${m.phone}` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.secondaryText} />
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Member</Text>
            <Text style={[styles.hint, { color: theme.secondaryText }]}>
              Supabase sends a confirmation email automatically. The member can log in after confirming.
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>Full name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Priya Sharma"
              placeholderTextColor={theme.secondaryText}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="member@example.com"
              placeholderTextColor={theme.secondaryText}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>Password (min 8 chars)</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Temporary password"
              placeholderTextColor={theme.secondaryText}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
            />

            <Text style={[styles.label, { color: theme.text }]}>Phone (optional)</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+91…"
              placeholderTextColor={theme.secondaryText}
              keyboardType="phone-pad"
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
                onPress={addMember}
                disabled={saving}
                style={[styles.btn, { backgroundColor: theme.primary, opacity: saving ? 0.6 : 1 }]}
              >
                <Text style={{ color: theme.background, fontWeight: '800' }}>
                  {saving ? 'Adding…' : 'Add Member'}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginTop: 5 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '600', marginLeft: 5 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', padding: 15,
    borderRadius: 12, borderWidth: 1, marginBottom: 20,
  },
  statsCard: {
    flexDirection: 'row', alignItems: 'center', padding: 20,
    borderRadius: 14, marginBottom: 25,
  },
  count: { fontSize: 24, fontWeight: 'bold' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  emptyCard: {
    alignItems: 'center', justifyContent: 'center',
    padding: 35, borderRadius: 14, borderWidth: 1,
  },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', marginTop: 15 },
  emptySubtitle: { fontSize: 13, marginTop: 7, textAlign: 'center' },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 22,
  },
  modalCard: { borderRadius: 18, borderWidth: 1, padding: 22 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  hint: { fontSize: 12, lineHeight: 17, marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  input: {
    height: 44, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14,
  },
  btn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 11,
  },
});
