import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';

function AppNavigator() {
  const { theme, themeMode } = useAppTheme();

  return (
    <>
      <StatusBar
        style={themeMode === 'dark' ? 'light' : 'dark'}
        
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

        {/* Gym Owner */}
        <Stack.Screen name="(admin)" />

        {/* Member */}
        <Stack.Screen name="(member)" />

        {/* Super Admin */}
        <Stack.Screen name="(super-admin)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}