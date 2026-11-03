
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const { theme } = useAppTheme();
const styles = createStyles(theme);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'success'; msg: string } | null>(null);

  const { role } = useLocalSearchParams<{ role?: string }>();


const notify = (title: string, msg: string, kind: 'error' | 'success' = 'error') => {
  setFeedback({ kind, msg: `${title}: ${msg}` });
  // Alert.alert also fires on native; on web it falls back to window.alert.
  Alert.alert(title, msg);
};

const handleRegister = async () => {
  setFeedback(null);
  if (
    !name.trim() ||
    !email.trim() ||
    !phone.trim() ||
    !password ||
    !confirmPassword
  ) {
    notify('Missing details', 'Please fill in all fields.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    notify('Invalid email', 'Please enter a valid email address.');
    return;
  }
  if (!/^\d{10}$/.test(phone.trim())) {
    notify('Invalid phone', 'Enter a 10-digit phone number.');
    return;
  }
  if (password.length < 8) {
    notify('Weak password', 'Password must contain at least 8 characters.');
    return;
  }
  if (password !== confirmPassword) {
    notify('Password mismatch', 'Both passwords must match.');
    return;
  }

  setSubmitting(true);
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          phone: phone.trim(),
          requested_role: role ?? 'member',
        },
      },
    });
    if (error) {
      const m = error.message || '';
      // Make Supabase's cryptic rate-limit error actionable.
      const friendly = /rate limit|over_email_send/i.test(m)
        ? 'Too many signup attempts right now (Supabase email rate limit). Please wait a few minutes and try again.'
        : m;
      notify('Sign-up failed', friendly);
      return;
    }

    // If email confirmation is OFF, user comes back with a session already.
    if (data.session) {
      notify('Account created', 'Signing you in...', 'success');
      router.replace({ pathname: '/(auth)/login', params: { role: role ?? 'member' } });
      return;
    }
    notify('Account created', 'Check your email to confirm, then sign in.', 'success');
    router.replace({ pathname: '/(auth)/login', params: { role: role ?? 'member' } });
  } catch (e) {
    notify('Unexpected error', (e as Error).message ?? 'Please try again.');
  } finally {
    setSubmitting(false);
  }
};



  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>✳</Text>
        </View>
        <Text style={styles.brandName}>GYMSYNC</Text>
      </View>

      <Text style={styles.eyebrow}>START YOUR JOURNEY</Text>
      <Text style={styles.heading}>Create account</Text>
      <Text style={styles.subtitle}>
        A healthier lifestyle begins with one step.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor={theme.secondaryText}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={theme.secondaryText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Phone number</Text>
        <TextInput
          style={styles.input}
          placeholder="10-digit mobile number"
          placeholderTextColor={theme.secondaryText}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Minimum 8 characters"
          placeholderTextColor={theme.secondaryText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Confirm password</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter your password"
          placeholderTextColor={theme.secondaryText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {feedback && (
          <View style={[styles.feedback, feedback.kind === 'error' ? styles.feedbackError : styles.feedbackSuccess]}>
            <Text style={styles.feedbackText}>{feedback.msg}</Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.85 }, submitting && { opacity: 0.6 }]}
          onPress={handleRegister}
          disabled={submitting}
        >
          <Text style={styles.submitText}>{submitting ? 'Creating...' : 'Create Account'}</Text>
          {!submitting && <Text style={styles.arrow}>→</Text>}
        </Pressable>
      </View>

    
          <Pressable
            style={styles.loginRow}
            onPress={() =>
              router.push({
                pathname: '/(auth)/login',
                params: {
                  role: role ?? 'member',
                },
              })
            }
          >

        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text style={styles.loginHighlight}>Log in</Text>
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        YOUR FITNESS JOURNEY STARTS HERE
      </Text>
    </ScrollView>
  );
}

function createStyles(theme: (typeof Colors)['light']) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: 25,
      paddingTop: 55,
      paddingBottom: 25,
    },
    backButton: {
      alignSelf: 'flex-start',
      paddingVertical: 8,
      marginBottom: 24,
    },
    backText: {
      color: theme.secondaryText,
      fontSize: 15,
      fontWeight: '600',
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 30,
    },
    logo: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: theme.background,
      fontSize: 25,
      fontWeight: '900',
    },
    brandName: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: 2,
    },
    eyebrow: {
      color: theme.primary,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.5,
      marginBottom: 9,
    },
    heading: {
      color: theme.text,
      fontSize: 31,
      fontWeight: '800',
      letterSpacing: -0.7,
    },
    subtitle: {
      color: theme.secondaryText,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 9,
      marginBottom: 25,
    },
    form: {
      width: '100%',
    },
    label: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 8,
      marginTop: 14,
    },
    input: {
      height: 52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      paddingHorizontal: 15,
      fontSize: 14,
      color: theme.text,
    },
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      height: 55,
      borderRadius: 13,
      marginTop: 28,
    },
    submitText: {
      color: theme.background,
      fontSize: 15,
      fontWeight: '800',
    },
    arrow: {
      color: theme.background,
      fontSize: 20,
      marginLeft: 10,
    },
    loginRow: {
      alignItems: 'center',
      paddingVertical: 22,
    },
    loginText: {
      color: theme.secondaryText,
      fontSize: 13,
    },
    loginHighlight: {
      color: theme.primary,
      fontWeight: '800',
    },
    footer: {
      color: theme.secondaryText,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 1.5,
      textAlign: 'center',
      marginTop: 8,
    },
    feedback: {
      marginTop: 18,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
    },
    feedbackError: {
      backgroundColor: 'rgba(220, 60, 60, 0.08)',
      borderColor: 'rgba(220, 60, 60, 0.5)',
    },
    feedbackSuccess: {
      backgroundColor: 'rgba(60, 180, 110, 0.08)',
      borderColor: 'rgba(60, 180, 110, 0.5)',
    },
    feedbackText: {
      color: theme.text,
      fontSize: 13,
      lineHeight: 18,
    },
  });
}

