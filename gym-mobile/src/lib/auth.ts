import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { supabase } from './supabase';

async function doSignOut() {
  await supabase.auth.signOut();
  router.replace('/choose-role');
}

/** Call from any screen to sign out with confirmation. */
export function signOutWithConfirm() {
  // Native Alert's buttons aren't interactive on React Native Web in all browsers;
  // fall back to window.confirm there so the user actually sees the choice.
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.confirm('Are you sure you want to log out?')) {
      void doSignOut();
    }
    return;
  }
  Alert.alert('Log out', 'Are you sure you want to log out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log out', style: 'destructive', onPress: () => void doSignOut() },
  ]);
}
