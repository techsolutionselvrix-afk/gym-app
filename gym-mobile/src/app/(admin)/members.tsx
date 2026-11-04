import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, Profile } from '@/lib/api';

export default function MembersScreen() {
  const { theme } = useAppTheme();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api<Profile[]>('/members')
      .then((rows) => { if (active) { setMembers(rows); setError(null); } })
      .catch((e: any) => { if (active) setError(e?.message ?? 'Could not load members'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

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
          <Pressable style={[styles.addButton, { backgroundColor: theme.primary }]}>
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
              Members will appear here as they sign up.
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
container: {
flex: 1,
paddingHorizontal: 20,
},
header: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginTop: 15,
marginBottom: 25,
},
title: {
fontSize: 26,
fontWeight: 'bold',
},
subtitle: {
fontSize: 13,
marginTop: 5,
},
addButton: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: 15,
paddingVertical: 10,
borderRadius: 10,
},
addButtonText: {
color: '#FFFFFF',
fontWeight: '600',
marginLeft: 5,
},
searchBox: {
flexDirection: 'row',
alignItems: 'center',
padding: 15,
borderRadius: 12,
borderWidth: 1,
marginBottom: 20,
},
statsCard: {
flexDirection: 'row',
alignItems: 'center',
padding: 20,
borderRadius: 14,
marginBottom: 25,
},
count: {
fontSize: 24,
fontWeight: 'bold',
},
sectionHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 15,
},
sectionTitle: {
fontSize: 18,
fontWeight: 'bold',
},
emptyCard: {
alignItems: 'center',
justifyContent: 'center',
padding: 35,
borderRadius: 14,
borderWidth: 1,
},
emptyTitle: {
fontSize: 17,
fontWeight: 'bold',
marginTop: 15,
},
emptySubtitle: {
fontSize: 13,
marginTop: 7,
textAlign: 'center',
},
});
