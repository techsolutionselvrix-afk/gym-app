
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaProvider>
      <StatusBar
        style={colorScheme === 'dark' ? 'light' : 'dark'}
      />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="choose-role" />

        {/* Authentication */}
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />

        {/* Admin */}
        <Stack.Screen name="(admin)" />

        {/* Member */}
        <Stack.Screen name="(member)" />

       
      </Stack>
    </SafeAreaProvider>
  );
}

