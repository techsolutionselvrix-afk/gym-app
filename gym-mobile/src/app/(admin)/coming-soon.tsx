import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';

export default function ComingSoonScreen() {
  const { theme } = useAppTheme();
  const { feature, icon } = useLocalSearchParams<{ feature?: string; icon?: string }>();
  const title = feature || 'Coming Soon';
  const iconName = (icon as any) || 'construct-outline';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.center}>
        <View style={[styles.iconWrap, { backgroundColor: theme.inputBackground }]}>
          <Ionicons name={iconName} size={56} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          This feature is on the roadmap and will be available in an upcoming release.
        </Text>

        <Pressable
          style={[styles.backBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backBtnText, { color: theme.background }]}>Go Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 30 },
  backBtn: { paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12 },
  backBtnText: { fontSize: 14, fontWeight: '800' },
});
