import {
View,
Text,
StyleSheet,
ScrollView,
Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { signOutWithConfirm } from '@/lib/auth';

type MenuItem = {
  title: string;
  subtitle: string;
  icon: 'nutrition-outline' | 'alert-circle-outline' | 'color-palette-outline' | 'card-outline' | 'person-outline';
  onPress: () => void;
};

const menuItems: MenuItem[] = [
  {
    title: 'Diet Plans',
    subtitle: 'Create and manage diet plans',
    icon: 'nutrition-outline',
    onPress: () => router.push({
      pathname: '/(admin)/coming-soon' as any,
      params: { feature: 'Diet Plans', icon: 'nutrition-outline' },
    }),
  },
  {
    title: 'Red List',
    subtitle: 'View members requiring attention',
    icon: 'alert-circle-outline',
    onPress: () => router.push('/(admin)/members' as any),
  },
  {
    title: 'Customization',
    subtitle: 'Customize your gym experience',
    icon: 'color-palette-outline',
    onPress: () => router.push({
      pathname: '/(admin)/coming-soon' as any,
      params: { feature: 'Customization', icon: 'color-palette-outline' },
    }),
  },
  {
    title: 'Subscription',
    subtitle: 'Manage your subscription plan',
    icon: 'card-outline',
    onPress: () => router.push({
      pathname: '/(admin)/coming-soon' as any,
      params: { feature: 'Subscription', icon: 'card-outline' },
    }),
  },
  {
    title: 'Profile',
    subtitle: 'Manage your personal information',
    icon: 'person-outline',
    onPress: () => router.push('/(admin)/profile' as any),
  },
];

export default function MoreScreen() {
const { theme } = useAppTheme();

return (
<SafeAreaView
style={[styles.container, { backgroundColor: theme.background }]}
> <ScrollView showsVerticalScrollIndicator={false}> <View style={styles.header}>
<Text style={[styles.title, { color: theme.text }]}>More</Text>
<Text style={[styles.subtitle, { color: theme.secondaryText }]}>
Manage your gym and account </Text> </View>

```
    <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
      <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
        <Ionicons name="person" size={28} color="#FFFFFF" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.profileName, { color: theme.text }]}>
          Gym Owner
        </Text>
        <Text style={[styles.profileEmail, { color: theme.secondaryText }]}>
          Manage your owner account
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.secondaryText}
      />
    </View>

    <Text style={[styles.sectionTitle, { color: theme.text }]}>
      Management
    </Text>

    <View
      style={[
        styles.menuCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      {menuItems.map((item, index) => (
        <Pressable
          key={item.title}
          onPress={item.onPress}
          style={[
            styles.menuItem,
            index !== menuItems.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.menuIcon,
              { backgroundColor: theme.background },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={theme.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.menuTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.menuSubtitle, { color: theme.secondaryText }]}>
              {item.subtitle}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.secondaryText}
          />
        </Pressable>
      ))}
    </View>

    <Pressable
      style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, marginHorizontal: 20, marginTop: 10, paddingVertical: 14,
        borderRadius: 12, borderWidth: 1, borderColor: '#DC4545',
      }}
      onPress={signOutWithConfirm}
    >
      <Ionicons name="log-out-outline" size={20} color="#DC4545" />
      <Text style={{ color: '#DC4545', fontWeight: '700', fontSize: 15 }}>Log Out</Text>
    </Pressable>

    <Text style={[styles.version, { color: theme.secondaryText }]}>
      GymSync • Version 1.0.0
    </Text>
  </ScrollView>
</SafeAreaView>
 

);
}

const styles = StyleSheet.create({
container: {
flex: 1,
paddingHorizontal: 20,
},
header: {
marginTop: 15,
marginBottom: 22,
},
title: {
fontSize: 26,
fontWeight: 'bold',
},
subtitle: {
fontSize: 13,
marginTop: 5,
},
profileCard: {
flexDirection: 'row',
alignItems: 'center',
padding: 17,
borderRadius: 15,
marginBottom: 27,
gap: 13,
},
avatar: {
width: 52,
height: 52,
borderRadius: 26,
alignItems: 'center',
justifyContent: 'center',
},
profileName: {
fontSize: 16,
fontWeight: 'bold',
},
profileEmail: {
fontSize: 12,
marginTop: 5,
},
sectionTitle: {
fontSize: 18,
fontWeight: 'bold',
marginBottom: 13,
},
menuCard: {
borderRadius: 14,
borderWidth: 1,
paddingHorizontal: 14,
},
menuItem: {
flexDirection: 'row',
alignItems: 'center',
paddingVertical: 17,
gap: 13,
},
menuIcon: {
width: 44,
height: 44,
borderRadius: 12,
alignItems: 'center',
justifyContent: 'center',
},
menuTitle: {
fontSize: 14,
fontWeight: '600',
},
menuSubtitle: {
fontSize: 11,
marginTop: 4,
},
version: {
textAlign: 'center',
fontSize: 11,
marginTop: 25,
marginBottom: 20,
},
});
