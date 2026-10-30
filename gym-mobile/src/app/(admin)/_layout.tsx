import { Tabs, useRouter, usePathname } from 'expo-router';
import {
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OwnerTabLayout() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const items = [
    {
      label: 'Home',
      route: '/(admin)/dashboard',
      icon: 'home-outline' as const,
      activeIcon: 'home' as const,
    },
    {
      label: 'Members',
      route: '/(admin)/members',
      icon: 'people-outline' as const,
      activeIcon: 'people' as const,
    },
    {
      label: 'Attendance',
      route: '/(admin)/attendance',
      icon: 'calendar-outline' as const,
      activeIcon: 'calendar' as const,
    },
    {
      label: 'Classes',
      route: '/(admin)/classes',
      icon: 'barbell-outline' as const,
      activeIcon: 'barbell' as const,
    },
    {
      label: 'More',
      route: '/(admin)/more',
      icon: 'menu-outline' as const,
      activeIcon: 'menu' as const,
    },
  ];

  return (
    <Tabs
  screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: theme.primary,
    tabBarInactiveTintColor: theme.secondaryText,
    tabBarStyle: {
      backgroundColor: theme.card,
      borderTopColor: theme.border,
      height: 70,
      paddingBottom: 10,
      paddingTop: 5,
    },
    tabBarItemStyle: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  }}
>
  <Tabs.Screen
    name="dashboard"
    options={{
      title: 'Home',
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={String(color ?? '#999999')} />
      ),
    }}
  />

  <Tabs.Screen
    name="members"
    options={{
      title: 'Members',
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={String(color ?? '#999999')} />
      ),
    }}
  />

  <Tabs.Screen
    name="attendance"
    options={{
      title: 'Attendance',
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={String(color ?? '#999999')} />
      ),
    }}
  />

  <Tabs.Screen
    name="classes"
    options={{
      title: 'Classes',
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? 'barbell' : 'barbell-outline'} size={size} color={String(color ?? '#999999')} />
      ),
    }}
  />

  <Tabs.Screen
    name="more"
    options={{
      title: 'More',
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? 'menu' : 'menu-outline'} size={size} color={String(color ?? '#999999')}/>
      ),
    }}
  />
</Tabs>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    gap: 4,
  },
  centerNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    gap: 4,
    marginTop: -16,
  },
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  activeLabel: {
    fontWeight: '700',
  },
});