import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { signOutWithConfirm } from '@/lib/auth';

export default function SuperAdminMoreScreen() {
  const { theme, themeMode } = useAppTheme();
  const router = useRouter();

  const menuSections = [
    {
      title: 'Platform Management',
      items: [
        {
          title: 'Admin Management',
          subtitle: 'Manage platform administrators',
          icon: 'people-outline' as const,
          color: '#7C3AED',
          action: () => Alert.alert('Admin Management', 'Coming soon!'),
        },
        {
          title: 'Platform Settings',
          subtitle: 'Configure app settings',
          icon: 'settings-outline' as const,
          color: '#2563EB',
          action: () => Alert.alert('Platform Settings', 'Coming soon!'),
        },
        {
          title: 'Notifications',
          subtitle: 'Manage platform notifications',
          icon: 'notifications-outline' as const,
          color: '#D97706',
          action: () => Alert.alert('Notifications', 'Coming soon!'),
        },
      ],
    },
    {
      title: 'Support & Information',
      items: [
        {
          title: 'Help & Support',
          subtitle: 'Get assistance and support',
          icon: 'help-circle-outline' as const,
          color: '#0891B2',
          action: () => Alert.alert('Help & Support', 'Contact support at support@gymsync.com'),
        },
        {
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          icon: 'shield-checkmark-outline' as const,
          color: '#16A34A',
          action: () => Alert.alert('Privacy Policy', 'Privacy policy page coming soon.'),
        },
        {
          title: 'Terms & Conditions',
          subtitle: 'Read terms of service',
          icon: 'document-text-outline' as const,
          color: '#9333EA',
          action: () => Alert.alert('Terms & Conditions', 'Terms page coming soon.'),
        },
      ],
    },
  ];

  const handleLogout = () => {
    signOutWithConfirm();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.heading, { color: theme.text }]}>
              More
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              Settings and account management
            </Text>
          </View>

          <View style={[styles.headerIcon, { backgroundColor: theme.card }]}>
            <Ionicons name="menu-outline" size={25} color={theme.primary} />
          </View>
        </View>

        {/* Profile Card */}
        <Pressable
          style={[styles.profileCard, { backgroundColor: theme.card }]}
          onPress={() => Alert.alert('Profile', 'Profile management coming soon.')}
        >
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Ionicons name="person" size={29} color="#FFFFFF" />
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              Super Admin
            </Text>
            <Text style={[styles.profileEmail, { color: theme.secondaryText }]}>
              admin@gymsync.com
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>SUPER ADMIN</Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={theme.secondaryText}
          />
        </Pressable>

        {/* Menu Sections */}
        {menuSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {section.title}
            </Text>

            <View style={[styles.menuCard, { backgroundColor: theme.card }]}>
              {section.items.map((item, index) => (
                <React.Fragment key={item.title}>
                  <Pressable
                    style={styles.menuItem}
                    onPress={item.action}
                  >
                    <View
                      style={[
                        styles.menuIcon,
                        { backgroundColor: `${item.color}18` },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={21}
                        color={item.color}
                      />
                    </View>

                    <View style={styles.menuInfo}>
                      <Text style={[styles.menuTitle, { color: theme.text }]}>
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.menuSubtitle,
                          { color: theme.secondaryText },
                        ]}
                      >
                        {item.subtitle}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={19}
                      color={theme.secondaryText}
                    />
                  </Pressable>

                  {index !== section.items.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: theme.border },
                      ]}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* App Information */}
        <View style={[styles.appInfo, { backgroundColor: theme.card }]}>
          <Ionicons name="fitness-outline" size={27} color={theme.primary} />
          <Text style={[styles.appName, { color: theme.text }]}>
            GymSync
          </Text>
          <Text style={[styles.version, { color: theme.secondaryText }]}>
            Super Admin Panel • Version 1.0.0
          </Text>
        </View>

        {/* Logout */}
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <Text style={[styles.footerText, { color: theme.secondaryText }]}>
          © 2026 GymSync. All rights reserved.
        </Text>

        <View style={{ height: 25 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 23,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 5,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  avatar: {
    width: 57,
    height: 57,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
  },
  profileEmail: {
    fontSize: 12,
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginTop: 7,
  },
  roleText: {
    color: '#6D28D9',
    fontSize: 9,
    fontWeight: '800',
  },
  section: {
    marginTop: 25,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  menuCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 12,
  },
  menuIcon: {
    width: 41,
    height: 41,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  menuSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginLeft: 53,
  },
  appInfo: {
    marginHorizontal: 16,
    marginTop: 25,
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  appName: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 7,
  },
  version: {
    fontSize: 11,
    marginTop: 5,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 16,
  },
});