
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';

export default function ProfileScreen() {
  const { theme, themeMode } = useAppTheme();
  const styles = createStyles(theme);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const showComingSoon = (feature: string) => {
    Alert.alert(feature, 'This feature will be available soon.');
  };

  const settings = [
    {
      title: 'Personal Information',
      subtitle: 'Manage your personal details',
      icon: 'person-outline' as const,
      action: () => showComingSoon('Personal Information'),
    },
    {
      title: 'Membership',
      subtitle: 'View your plan and validity',
      icon: 'card-outline' as const,
      action: () => showComingSoon('Membership'),
    },
    {
      title: 'Workout History',
      subtitle: 'Review your fitness activity',
      icon: 'barbell-outline' as const,
      action: () => showComingSoon('Workout History'),
    },
    {
      title: 'Notifications',
      subtitle: notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled',
      icon: 'notifications-outline' as const,
      action: () => setNotificationsEnabled((value) => !value),
      showToggle: true,
    },
    {
      title: 'Privacy & Security',
      subtitle: 'Manage account security',
      icon: 'shield-checkmark-outline' as const,
      action: () => showComingSoon('Privacy & Security'),
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help with your account',
      icon: 'help-circle-outline' as const,
      action: () => showComingSoon('Help & Support'),
    },
  ];

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
            <Text style={styles.pageTitle}>My Profile</Text>
          </View>

          <Pressable
            style={styles.headerButton}
            onPress={() => showComingSoon('Edit Profile')}
            accessibilityLabel="Edit profile"
          >
            <Ionicons name="create-outline" size={22} color={theme.text} />
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={43} color={theme.primary} />
          </View>

          <Text style={styles.name}>Gym Member</Text>
          <Text style={styles.email}>member@gymsync.com</Text>

          <View style={styles.memberBadge}>
            <Ionicons name="checkmark-circle" size={15} color={theme.primary} />
            <Text style={styles.memberBadgeText}>Verified Member</Text>
          </View>

          <View style={styles.profileDivider} />

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={theme.secondaryText}
              />
              <Text style={styles.detailLabel}>Member since</Text>
              <Text style={styles.detailValue}>2026</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.detailItem}>
              <Ionicons
                name="fitness-outline"
                size={18}
                color={theme.secondaryText}
              />
              <Text style={styles.detailLabel}>Workout goal</Text>
              <Text style={styles.detailValue}>Stay Fit</Text>
            </View>
          </View>
        </View>

        {/* Membership Card */}
        <View style={styles.membershipCard}>
          <View style={styles.membershipTop}>
            <View>
              <Text style={styles.membershipEyebrow}>YOUR MEMBERSHIP</Text>
              <Text style={styles.membershipTitle}>Premium Plan</Text>
              <Text style={styles.membershipSubtitle}>
                Your fitness journey starts here
              </Text>
            </View>

            <View style={styles.membershipIcon}>
              <Ionicons name="diamond-outline" size={27} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.membershipFooter}>
            <View>
              <Text style={styles.membershipSmallLabel}>STATUS</Text>
              <Text style={styles.membershipStatus}>Active</Text>
            </View>

            <Pressable
              style={styles.viewPlanButton}
              onPress={() => showComingSoon('Membership Details')}
            >
              <Text style={styles.viewPlanText}>View Plan</Text>
              <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Activity</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E1F8E9' }]}>
                <Ionicons name="calendar-outline" size={21} color="#239653" />
              </View>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Visits this month</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FFF0D8' }]}>
                <Ionicons name="flame-outline" size={21} color="#D68A19" />
              </View>
              <Text style={styles.statNumber}>5 days</Text>
              <Text style={styles.statLabel}>Current streak</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E6EDFF' }]}>
                <Ionicons name="time-outline" size={21} color="#536DE8" />
              </View>
              <Text style={styles.statNumber}>18 hrs</Text>
              <Text style={styles.statLabel}>Workout time</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <View style={styles.settingsCard}>
            {settings.map((item, index) => (
              <Pressable
                key={item.title}
                onPress={item.action}
                style={[
                  styles.settingItem,
                  index !== settings.length - 1 && styles.settingBorder,
                ]}
              >
                <View style={styles.settingIcon}>
                  <Ionicons
                    name={item.icon}
                    size={21}
                    color={theme.primary}
                  />
                </View>

                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>

                {'showToggle' in item && item.showToggle ? (
                  <View
                    style={[
                      styles.toggle,
                      notificationsEnabled && styles.toggleActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleKnob,
                        notificationsEnabled && styles.toggleKnobActive,
                      ]}
                    />
                  </View>
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color={theme.secondaryText}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Logout */}
        <Pressable
          style={styles.logoutButton}
          onPress={() =>
            Alert.alert(
              'Log Out',
              'Logout functionality will be connected to your authentication system.',
              [{ text: 'OK' }],
            )
          }
        >
          <Ionicons name="log-out-outline" size={21} color="#DC4545" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <Text style={styles.version}>GymSync · Version 1.0.0</Text>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: (typeof Colors)['light']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 22,
    },
    eyebrow: {
      color: theme.primary,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginBottom: 5,
    },
    pageTitle: {
      color: theme.text,
      fontSize: 28,
      fontWeight: '800',
    },
    headerButton: {
      width: 45,
      height: 45,
      borderRadius: 15,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileCard: {
      backgroundColor: theme.card,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 22,
      alignItems: 'center',
      marginBottom: 17,
    },
    avatar: {
      width: 86,
      height: 86,
      borderRadius: 28,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    name: {
      color: theme.text,
      fontSize: 22,
      fontWeight: '800',
    },
    email: {
      color: theme.secondaryText,
      fontSize: 13,
      marginTop: 5,
    },
    memberBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.background,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginTop: 13,
    },
    memberBadgeText: {
      color: theme.primary,
      fontSize: 11,
      fontWeight: '700',
    },
    profileDivider: {
      height: 1,
      width: '100%',
      backgroundColor: theme.border,
      marginVertical: 20,
    },
    profileDetails: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-around',
    },
    detailItem: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
    },
    detailLabel: {
      color: theme.secondaryText,
      fontSize: 11,
    },
    detailValue: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '700',
    },
    verticalDivider: {
      width: 1,
      backgroundColor: theme.border,
      marginHorizontal: 10,
    },
    membershipCard: {
      backgroundColor: theme.primary,
      borderRadius: 21,
      padding: 20,
      marginBottom: 26,
    },
    membershipTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    membershipEyebrow: {
      color: '#FFFFFF',
      opacity: 0.8,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
    },
    membershipTitle: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '800',
      marginTop: 8,
    },
    membershipSubtitle: {
      color: '#FFFFFF',
      opacity: 0.85,
      fontSize: 11,
      marginTop: 5,
    },
    membershipIcon: {
      width: 53,
      height: 53,
      borderRadius: 17,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    membershipFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.25)',
      marginTop: 20,
      paddingTop: 16,
    },
    membershipSmallLabel: {
      color: '#FFFFFF',
      opacity: 0.8,
      fontSize: 10,
      fontWeight: '700',
    },
    membershipStatus: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
      marginTop: 4,
    },
    viewPlanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 11,
      backgroundColor: 'rgba(255,255,255,0.17)',
    },
    viewPlanText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    section: {
      marginBottom: 26,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 14,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 9,
    },
    statCard: {
      flex: 1,
      minWidth: 0,
      backgroundColor: theme.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
    },
    statIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 11,
    },
    statNumber: {
      color: theme.text,
      fontSize: 17,
      fontWeight: '800',
    },
    statLabel: {
      color: theme.secondaryText,
      fontSize: 10,
      marginTop: 5,
      lineHeight: 14,
    },
    settingsCard: {
      backgroundColor: theme.card,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 14,
    },
    settingItem: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 13,
    },
    settingBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    settingIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingContent: {
      flex: 1,
      minWidth: 0,
    },
    settingTitle: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '700',
    },
    settingSubtitle: {
      color: theme.secondaryText,
      fontSize: 10,
      marginTop: 5,
    },
    toggle: {
      width: 42,
      height: 24,
      borderRadius: 20,
      padding: 3,
      justifyContent: 'center',
      backgroundColor: theme.border,
    },
    toggleActive: {
      backgroundColor: theme.primary,
    },
    toggleKnob: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#FFFFFF',
    },
    toggleKnobActive: {
      alignSelf: 'flex-end',
    },
    logoutButton: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: '#F3CDCD',
      borderRadius: 15,
      backgroundColor: theme.card,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
    },
    logoutText: {
      color: '#DC4545',
      fontSize: 14,
      fontWeight: '700',
    },
    version: {
      color: theme.secondaryText,
      textAlign: 'center',
      fontSize: 11,
      marginTop: 16,
    },
  });
}



