import {
View,
Text,
StyleSheet,
ScrollView,
TextInput,
Pressable,
} from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Api } from '@/lib/api';

type Row = { id: string; name: string; time: string; status: string };

export default function AttendanceScreen() {
const { theme } = useAppTheme();

const [members, setMembers] = useState<Row[]>([]);

useEffect(() => {
  let active = true;
  Api.listMembers()
    .then((rows) => {
      if (!active) return;
      setMembers(rows.map((m) => ({
        id: m.id,
        name: m.full_name || m.email || 'Unnamed',
        time: '—',
        status: 'Absent',
      })));
    })
    .catch(() => {});
  return () => { active = false; };
}, []);
const [search, setSearch] = useState('');

const presentCount = members.filter(
(member) => member.status === 'Present'
).length;

const absentCount = members.filter(
(member) => member.status === 'Absent'
).length;

const lateCount = members.filter(
(member) => member.status === 'Late'
).length;

const markAttendance = (id: string, status: string) => {
setMembers((previous) =>
previous.map((member) =>
member.id === id
? {
...member,
status,
time: status === 'Absent' ? '--' : 'Now',
}
: member
)
);
};

const filteredMembers = members.filter((member) =>
member.name.toLowerCase().includes(search.toLowerCase())
);

return (
<SafeAreaView
style={[styles.container, { backgroundColor: theme.background }]}
> <ScrollView showsVerticalScrollIndicator={false}> <View style={styles.header}> <View>
<Text style={[styles.title, { color: theme.text }]}>
Attendance </Text>
<Text style={[styles.subtitle, { color: theme.secondaryText }]}>
Track your members' attendance </Text> </View>

```
      <Pressable
        style={[styles.dateButton, { backgroundColor: theme.card }]}
      >
        <Ionicons
          name="calendar-outline"
          size={19}
          color={theme.primary}
        />
        <Text style={[styles.dateText, { color: theme.text }]}>
          Today
        </Text>
      </Pressable>
    </View>

    <View style={[styles.dateCard, { backgroundColor: theme.card }]}>
      <Text style={[styles.dateLabel, { color: theme.secondaryText }]}>
        Today's Attendance
      </Text>
      <Text style={[styles.dateValue, { color: theme.text }]}>
        {new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </Text>
    </View>

    <View style={styles.statsRow}>
      <View style={[styles.statCard, { backgroundColor: theme.card }]}>
        <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
        <Text style={[styles.statNumber, { color: theme.text }]}>
          {presentCount}
        </Text>
        <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
          Present
        </Text>
      </View>

      <View style={[styles.statCard, { backgroundColor: theme.card }]}>
        <Ionicons name="close-circle" size={24} color="#DC2626" />
        <Text style={[styles.statNumber, { color: theme.text }]}>
          {absentCount}
        </Text>
        <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
          Absent
        </Text>
      </View>

      <View style={[styles.statCard, { backgroundColor: theme.card }]}>
        <Ionicons name="time" size={24} color="#D97706" />
        <Text style={[styles.statNumber, { color: theme.text }]}>
          {lateCount}
        </Text>
        <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
          Late
        </Text>
      </View>
    </View>

    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Member Attendance
      </Text>
      <Text style={{ color: theme.secondaryText, fontSize: 12 }}>
        {members.length} Members
      </Text>
    </View>

    <View
      style={[
        styles.searchBox,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={theme.secondaryText}
      />
      <TextInput
        placeholder="Search member..."
        placeholderTextColor={theme.secondaryText}
        value={search}
        onChangeText={setSearch}
        style={[styles.searchInput, { color: theme.text }]}
      />
    </View>

    {filteredMembers.map((member) => (
      <View
        key={member.id}
        style={[
          styles.memberCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.memberInfo}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.background },
            ]}
          >
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              {member.name.charAt(0)}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.memberName, { color: theme.text }]}>
              {member.name}
            </Text>
            <Text style={{ color: theme.secondaryText, fontSize: 12 }}>
              {member.time}
            </Text>
          </View>

          <Text
            style={[
              styles.status,
              {
                color:
                  member.status === 'Present'
                    ? '#16A34A'
                    : member.status === 'Late'
                      ? '#D97706'
                      : '#DC2626',
              },
            ]}
          >
            {member.status}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => markAttendance(member.id, 'Present')}
            style={[
              styles.actionButton,
              { backgroundColor: '#16A34A15' },
            ]}
          >
            <Ionicons name="checkmark" size={16} color="#16A34A" />
            <Text style={{ color: '#16A34A', fontSize: 12 }}>
              Present
            </Text>
          </Pressable>

          <Pressable
            onPress={() => markAttendance(member.id, 'Absent')}
            style={[
              styles.actionButton,
              { backgroundColor: '#DC262615' },
            ]}
          >
            <Ionicons name="close" size={16} color="#DC2626" />
            <Text style={{ color: '#DC2626', fontSize: 12 }}>
              Absent
            </Text>
          </Pressable>

          <Pressable
            onPress={() => markAttendance(member.id, 'Late')}
            style={[
              styles.actionButton,
              { backgroundColor: '#D9770615' },
            ]}
          >
            <Ionicons name="time-outline" size={16} color="#D97706" />
            <Text style={{ color: '#D97706', fontSize: 12 }}>
              Late
            </Text>
          </Pressable>
        </View>
      </View>
    ))}

    {filteredMembers.length === 0 && (
      <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
        No members found.
      </Text>
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
marginBottom: 20,
},
title: {
fontSize: 26,
fontWeight: 'bold',
},
subtitle: {
fontSize: 12,
marginTop: 5,
},
dateButton: {
flexDirection: 'row',
alignItems: 'center',
padding: 10,
borderRadius: 10,
gap: 6,
},
dateText: {
fontSize: 12,
fontWeight: '600',
},
dateCard: {
padding: 17,
borderRadius: 14,
marginBottom: 16,
},
dateLabel: {
fontSize: 12,
},
dateValue: {
fontSize: 17,
fontWeight: 'bold',
marginTop: 6,
},
statsRow: {
flexDirection: 'row',
gap: 10,
marginBottom: 25,
},
statCard: {
flex: 1,
alignItems: 'center',
paddingVertical: 16,
borderRadius: 13,
},
statNumber: {
fontSize: 22,
fontWeight: 'bold',
marginTop: 7,
},
statLabel: {
fontSize: 11,
marginTop: 3,
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
searchBox: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: 14,
borderRadius: 12,
borderWidth: 1,
marginBottom: 15,
},
searchInput: {
flex: 1,
height: 48,
marginLeft: 10,
fontSize: 14,
},
memberCard: {
padding: 14,
borderRadius: 13,
borderWidth: 1,
marginBottom: 12,
},
memberInfo: {
flexDirection: 'row',
alignItems: 'center',
gap: 10,
},
avatar: {
width: 42,
height: 42,
borderRadius: 21,
alignItems: 'center',
justifyContent: 'center',
},
avatarText: {
fontSize: 17,
fontWeight: 'bold',
},
memberName: {
fontSize: 14,
fontWeight: '600',
},
status: {
fontSize: 12,
fontWeight: 'bold',
},
actionRow: {
flexDirection: 'row',
gap: 8,
marginTop: 14,
flexWrap: 'wrap',
},
actionButton: {
flexDirection: 'row',
alignItems: 'center',
gap: 4,
paddingHorizontal: 10,
paddingVertical: 8,
borderRadius: 8,
},
emptyText: {
textAlign: 'center',
marginTop: 30,
},
});
