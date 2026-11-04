import {
View,
Text,
StyleSheet,
Pressable,
ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const classes: {
  id: string; name: string; trainer: string; time: string;
  icon: 'body-outline' | 'musical-notes-outline' | 'barbell-outline' | 'heart-outline';
  members: number;
}[] = [];

export default function ClassesScreen() {
const { theme } = useAppTheme();

return (
<SafeAreaView
style={[styles.container, { backgroundColor: theme.background }]}
> <ScrollView showsVerticalScrollIndicator={false}> <View style={styles.header}> <View>
<Text style={[styles.title, { color: theme.text }]}>
Classes </Text>
<Text style={[styles.subtitle, { color: theme.secondaryText }]}>
Manage your gym classes </Text> </View>


      <Pressable
        style={[styles.addButton, { backgroundColor: theme.primary }]}
      >
        <Ionicons name="add" size={22} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add</Text>
      </Pressable>
    </View>

    <View style={styles.statsRow}>
      <View style={[styles.statCard, { backgroundColor: theme.card }]}>
        <Ionicons name="fitness-outline" size={25} color={theme.primary} />
        <Text style={[styles.statNumber, { color: theme.text }]}>4</Text>
        <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
          Total Classes
        </Text>
      </View>

      <View style={[styles.statCard, { backgroundColor: theme.card }]}>
        <Ionicons name="people-outline" size={25} color={theme.primary} />
        <Text style={[styles.statNumber, { color: theme.text }]}>45</Text>
        <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
          Enrolled Members
        </Text>
      </View>
    </View>

    <Text style={[styles.sectionTitle, { color: theme.text }]}>
      All Classes
    </Text>

    {classes.length === 0 && (
      <View style={{
        padding: 24, borderRadius: 14, borderWidth: 1,
        borderColor: theme.border, backgroundColor: theme.card,
        alignItems: 'center',
      }}>
        <Ionicons name="calendar-outline" size={36} color={theme.secondaryText} />
        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15, marginTop: 10 }}>
          No classes yet
        </Text>
        <Text style={{ color: theme.secondaryText, fontSize: 12, textAlign: 'center', marginTop: 6 }}>
          Scheduled classes will appear here.
        </Text>
      </View>
    )}

    {classes.map((item) => (
      <View
        key={item.id}
        style={[
          styles.classCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.classTop}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: theme.background },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={25}
              color={theme.primary}
            />
          </View>

          <View style={styles.classInfo}>
            <Text style={[styles.className, { color: theme.text }]}>
              {item.name}
            </Text>
            <Text style={{ color: theme.secondaryText, fontSize: 13 }}>
              {item.trainer}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.secondaryText}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.classBottom}>
          <View style={styles.detail}>
            <Ionicons
              name="time-outline"
              size={17}
              color={theme.secondaryText}
            />
            <Text style={[styles.detailText, { color: theme.secondaryText }]}>
              {item.time}
            </Text>
          </View>

          <View style={styles.detail}>
            <Ionicons
              name="people-outline"
              size={17}
              color={theme.secondaryText}
            />
            <Text style={[styles.detailText, { color: theme.secondaryText }]}>
              {item.members} Members
            </Text>
          </View>
        </View>
      </View>
    ))}
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
statsRow: {
flexDirection: 'row',
gap: 12,
marginBottom: 25,
},
statCard: {
flex: 1,
padding: 17,
borderRadius: 14,
},
statNumber: {
fontSize: 23,
fontWeight: 'bold',
marginTop: 10,
},
statLabel: {
fontSize: 12,
marginTop: 3,
},
sectionTitle: {
fontSize: 18,
fontWeight: 'bold',
marginBottom: 15,
},
classCard: {
padding: 16,
borderRadius: 14,
borderWidth: 1,
marginBottom: 14,
},
classTop: {
flexDirection: 'row',
alignItems: 'center',
},
iconBox: {
width: 48,
height: 48,
borderRadius: 12,
alignItems: 'center',
justifyContent: 'center',
},
classInfo: {
flex: 1,
marginLeft: 12,
},
className: {
fontSize: 16,
fontWeight: 'bold',
marginBottom: 4,
},
divider: {
height: 1,
backgroundColor: '#88888830',
marginVertical: 14,
},
classBottom: {
flexDirection: 'row',
justifyContent: 'space-between',
flexWrap: 'wrap',
gap: 10,
},
detail: {
flexDirection: 'row',
alignItems: 'center',
gap: 5,
},
detailText: {
fontSize: 11,
},
});
