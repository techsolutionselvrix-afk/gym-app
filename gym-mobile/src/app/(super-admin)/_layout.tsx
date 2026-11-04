import { Tabs, useRouter, usePathname } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoleGuard } from '@/lib/useRoleGuard';

export default function SuperAdminLayout() {
  const { theme, themeMode } = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const guard = useRoleGuard('super_admin');

  if (guard !== 'authorized') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  const items = [
    {
      label: 'Home',
      route: '/(super-admin)/dashboard',
      icon: 'grid-outline' as const,
      activeIcon: 'grid' as const,
    },
    {
      label: 'Plans',
      route: '/(super-admin)/plans',
      icon: 'pricetags-outline' as const,
      activeIcon: 'pricetags' as const,
    },
    {
      label: 'Gyms',
      route: '/(super-admin)/gyms',
      icon: 'business-outline' as const,
      activeIcon: 'business' as const,
    },
    {
      label: 'Billing',
      route: '/(super-admin)/billing',
      icon: 'wallet-outline' as const,
      activeIcon: 'wallet' as const,
    },
    {
      label: 'More',
      route: '/(super-admin)/more',
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
          <Ionicons
            name={focused ? 'grid' : 'grid-outline'}
            size={size}
            color={String(color ?? '#999999')}
          />
        ),
      }}
    />

    <Tabs.Screen
      name="plans"
      options={{
        title: 'Plans',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? 'pricetags' : 'pricetags-outline'}
            size={size}
            color={String(color ?? '#999999')}
          />
        ),
      }}
    />

    <Tabs.Screen
      name="gyms"
      options={{
        title: 'Gyms',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? 'business' : 'business-outline'}
            size={size}
            color={String(color ?? '#999999')}
          />
        ),
      }}
    />

    <Tabs.Screen
      name="billing"
      options={{
        title: 'Billing',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? 'wallet' : 'wallet-outline'}
            size={size}
            color={String(color ?? '#999999')}
          />
        ),
      }}
    />

    <Tabs.Screen
      name="more"
      options={{
        title: 'More',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? 'menu' : 'menu-outline'}
            size={size}
            color={String(color ?? '#999999')}
          />
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