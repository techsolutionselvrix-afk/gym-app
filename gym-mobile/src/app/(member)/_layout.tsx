
import { Tabs, useRouter, usePathname } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MemberLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const items = [
    {
      label: 'Home',
      route: '/(member)/dashboard',
      icon: 'home-outline' as const,
      activeIcon: 'home' as const,
    },
    {
      label: 'Attendance',
      route: '/(member)/attendance',
      icon: 'calendar-outline' as const,
      activeIcon: 'calendar' as const,
    },
    {
      label: 'Scan',
      route: '/(member)/scan',
      icon: 'qr-code-outline' as const,
      activeIcon: 'qr-code' as const,
    },
    {
      label: 'Diet',
      route: '/(member)/diet-plan',
      icon: 'nutrition-outline' as const,
      activeIcon: 'nutrition' as const,
    },
    {
      label: 'Profile',
      route: '/(member)/profile',
      icon: 'person-outline' as const,
      activeIcon: 'person' as const,
    },
  ];

  return (
    <Tabs
      tabBar={() => (
        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
              paddingBottom: Math.max(insets.bottom, 8),
            },
          ]}
        >
          {items.map((item, index) => {
            const active = pathname.endsWith(
              item.route.split('/').pop() || ''
            );
            const isScan = index === 2;
            const iconColor = active ? theme.primary : theme.secondaryText;

            return (
              <Pressable
                key={item.label}
                style={isScan ? styles.centerNavItem : styles.navItem}
                onPress={() => router.navigate(item.route as any)}
              >
                {isScan ? (
                  <View
                    style={[
                      styles.centerScanButton,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <Ionicons name="qr-code" size={25} color="#FFFFFF" />
                  </View>
                ) : (
                  <Ionicons
                    name={active ? item.activeIcon : item.icon}
                    size={23}
                    color={iconColor}
                  />
                )}

                <Text
                  style={[
                    styles.navLabel,
                    { color: isScan ? theme.primary : iconColor },
                    active && styles.activeLabel,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
      <Tabs.Screen name="attendance" options={{ title: 'Attendance' }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan QR' }} />
      <Tabs.Screen name="diet-plan" options={{ title: 'Diet Plan' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      {/* <Tabs.Screen name="membership" options={{ href: null }} /> */}
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
  centerScanButton: {
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

