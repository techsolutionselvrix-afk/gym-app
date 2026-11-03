
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Api, ApiError } from '@/lib/api';


export default function LoginScreen() {
 const { theme, themeMode } = useAppTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

 const { role } = useLocalSearchParams<{ role?: string }>();



const routeForRole = (r: string) => {
  if (r === 'super_admin') return '/(super-admin)/dashboard';
  if (r === 'admin') return '/(admin)/dashboard';
  return '/(member)/dashboard';
};

const showError = (msg: string) => {
  setErrorMsg(msg);
  Alert.alert('Login', msg);
};

const handleLogin = async () => {
  setErrorMsg(null);
  if (!email.trim() || !password) {
    showError('Please enter your email and password.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    showError('Please enter a valid email address.');
    return;
  }

  setSubmitting(true);
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      showError(error.message);
      return;
    }
    const me = await Api.me();
    router.replace(routeForRole(me.role) as any);
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : (e as Error).message;
    showError(msg ?? 'Unexpected error. Please try again.');
  } finally {
    setSubmitting(false);
  }
};



  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
  barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
/>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.text }]}>← Back</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: theme.primary }]}>
            <Text style={styles.logoText}>G</Text>
          </View>

          <Text style={[styles.brand, { color: theme.text }]}>GYMSYNC</Text>

          <Text style={[styles.heading, { color: theme.text }]}>
            Welcome back!
          </Text>

          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            Sign in to continue your fitness journey.
          </Text>
        </View>

        <View
          style={[
            styles.form,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.label, { color: theme.text }]}>Email address</Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="you@example.com"
            placeholderTextColor={theme.secondaryText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: theme.text }]}>Password</Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Enter your password"
            placeholderTextColor={theme.secondaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {errorMsg && (
            <View style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 10,
              borderWidth: 1,
              backgroundColor: 'rgba(220, 60, 60, 0.08)',
              borderColor: 'rgba(220, 60, 60, 0.5)',
            }}>
              <Text style={{ color: theme.text, fontSize: 13, lineHeight: 18 }}>{errorMsg}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
              submitting && { opacity: 0.6 },
            ]}
            onPress={handleLogin}
            disabled={submitting}
          >
            <Text
              style={[
                styles.loginButtonText,
                { color: themeMode === 'dark' ? '#141A17' : '#FFFFFF' },
              ]}
            >
              {submitting ? 'Signing in...' : 'Log In'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.registerRow}>
          <Text style={{ color: theme.secondaryText }}>
            Don't have an account?{' '}
          </Text>

          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.registerText, { color: theme.primary }]}>
              Create account
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.footer, { color: theme.secondaryText }]}>
          Your fitness journey starts here.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    marginBottom: 20,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  brand: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 28,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  form: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 9,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 20,
  },
  loginButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 24,
  },
  registerText: {
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 30,
  },
});

