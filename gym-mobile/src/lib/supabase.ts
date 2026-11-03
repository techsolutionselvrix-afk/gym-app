import 'react-native-url-polyfill/auto';
import { createClient, SupportedStorage } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Loud at startup so misconfig doesn't fail silently in production.
  // Don't crash — allow the UI to show a friendly error.
  // eslint-disable-next-line no-console
  console.warn('[supabase] Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

// SecureStore is unavailable on web; fall back to localStorage there.
const SecureStoreAdapter: SupportedStorage = {
  getItem: (k) => SecureStore.getItemAsync(k),
  setItem: (k, v) => SecureStore.setItemAsync(k, v),
  removeItem: (k) => SecureStore.deleteItemAsync(k),
};

const WebStorageAdapter: SupportedStorage = {
  getItem: async (k) => (typeof window !== 'undefined' ? window.localStorage.getItem(k) : null),
  setItem: async (k, v) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(k, v);
  },
  removeItem: async (k) => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(k);
  },
};

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '', {
  auth: {
    storage: Platform.OS === 'web' ? WebStorageAdapter : SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
