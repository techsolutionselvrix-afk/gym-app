import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MembersScreen() {
 const { theme } = useAppTheme();
return (
<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> <ScrollView showsVerticalScrollIndicator={false}> <View style={styles.header}> <View>
<Text style={[styles.title, { color: theme.text }]}>Members</Text>
<Text style={[styles.subtitle, { color: theme.secondaryText }]}>
Manage your gym members </Text> </View>


      <Pressable style={[styles.addButton, { backgroundColor: theme.primary }]}>
        <Ionicons name="add" size={22} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add</Text>
      </Pressable>
    </View>

    <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Ionicons name="search-outline" size={20} color={theme.secondaryText} />
      <Text style={{ color: theme.secondaryText, marginLeft: 10 }}>
        Search members...
      </Text>
    </View>

    <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
      <Ionicons name="people-outline" size={28} color={theme.primary} />
      <View style={{ marginLeft: 15 }}>
        <Text style={[styles.count, { color: theme.text }]}>0</Text>
        <Text style={{ color: theme.secondaryText }}>Total Members</Text>
      </View>
    </View>

    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        All Members
      </Text>
      <Text style={{ color: theme.secondaryText }}>0 members</Text>
    </View>

    <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Ionicons name="people-outline" size={45} color={theme.secondaryText} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Members Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.secondaryText }]}>
        Add your first gym member to get started.
      </Text>
    </View>
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
