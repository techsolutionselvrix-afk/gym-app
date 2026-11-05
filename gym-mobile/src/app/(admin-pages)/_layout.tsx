import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { useRoleGuard } from '@/lib/useRoleGuard';

export default function AdminPagesLayout() {
  const { theme } = useAppTheme();
  const guard = useRoleGuard('admin');

  if (guard !== 'authorized') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
