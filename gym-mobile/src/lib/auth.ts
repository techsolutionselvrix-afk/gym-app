import { router } from 'expo-router';
import { supabase } from './supabase';
import { showConfirm } from '@/components/ConfirmDialog';

async function doSignOut() {
  await supabase.auth.signOut();
  router.replace('/choose-role');
}

/** Call from any screen to sign out with themed confirmation. */
export function signOutWithConfirm() {
  showConfirm({
    title: 'Log out',
    message: 'Are you sure you want to log out?',
    confirmText: 'Log out',
    cancelText: 'Cancel',
    destructive: true,
    onConfirm: () => { void doSignOut(); },
  });
}
