import { StyleSheet, Text, View } from 'react-native';

export default function AdminClassesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classes</Text>
      <Text style={styles.message}>The admin classes page is coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
  },
});