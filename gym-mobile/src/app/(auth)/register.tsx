
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
// import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';

export default function RegisterScreen() {
  const systemTheme = useColorScheme();
  const mode = systemTheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[mode];
  const styles = createStyles(theme);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { role } = useLocalSearchParams<{ role?: string }>();

console.log('Received role on Register page:', role);

 
const handleRegister = () => {
  if (
    !name.trim() ||
    !email.trim() ||
    !phone.trim() ||
    !password ||
    !confirmPassword
  ) {
    Alert.alert('Missing details', 'Please fill in all fields.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    Alert.alert('Invalid email', 'Please enter a valid email address.');
    return;
  }

  if (!/^\d{10}$/.test(phone.trim())) {
    Alert.alert('Invalid phone', 'Enter a 10-digit phone number.');
    return;
  }

  if (password.length < 8) {
    Alert.alert(
      'Weak password',
      'Password must contain at least 8 characters.'
    );
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert('Password mismatch', 'Both passwords must match.');
    return;
  }


Alert.alert(
  'Form validated!',
  'Your registration form is ready. We will connect it to our backend next.',
  [
    {
      text: 'OK',
      onPress: () => {
        router.replace({
          pathname: '/(auth)/login',
          params: {
            role: role ?? 'member',
          },
        });
      },
    },
  ]
);


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

        <Pressable style={styles.submitButton} onPress={handleRegister}>
          <Text style={styles.submitText}>Create Account</Text>
          <Text style={styles.arrow}>→</Text>
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
  });
}

