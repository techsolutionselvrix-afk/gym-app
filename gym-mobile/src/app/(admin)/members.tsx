import { StyleSheet, Text, View } from 'react-native';

export default function AdminMembersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Members</Text>
      <Text style={styles.message}>The admin members page is coming soon.</Text>
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