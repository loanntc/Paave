import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/src/theme';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { SecondaryButton } from '@/src/components/ui/SecondaryButton';
import { SocialLoginButton } from '@/src/components/ui/SocialLoginButton';
import { TextInput } from '@/src/components/ui/TextInput';
import { useToast } from '@/src/components/providers/ToastProvider';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = email.trim().length > 0 && password.length >= 8;

  const handleLogin = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      // TODO: Call auth API
      // For now, navigate to home
      router.replace('/(main)/home');
    } catch {
      showToast('Email hoac mat khau khong dung', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // TODO: Implement social login
    showToast(`Dang xu ly ${provider}...`, 'info');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>P</Text>
          </View>
          <Text style={styles.title}>Dang nhap</Text>
          <Text style={styles.subtitle}>
            Chao mung tro lai! Nhap thong tin de tiep tuc.
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
          />
          <View style={styles.fieldGap} />
          <TextInput
            label="Mat khau"
            value={password}
            onChangeText={setPassword}
            placeholder="Nhap mat khau"
            secureTextEntry
          />

          {/* Forgot password */}
          <Pressable
            style={styles.forgotLink}
            onPress={() => router.push('/(auth)/forgot-password/email')}
            hitSlop={8}
          >
            <Text style={styles.linkText}>Quen mat khau?</Text>
          </Pressable>
        </View>

        {/* Login CTA */}
        <PrimaryButton
          label="Dang nhap"
          onPress={handleLogin}
          disabled={!isFormValid}
          loading={loading}
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoac</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={styles.socialButtons}>
          <SocialLoginButton
            provider="google"
            onPress={() => handleSocialLogin('google')}
          />
          <View style={styles.socialGap} />
          <SocialLoginButton
            provider="apple"
            onPress={() => handleSocialLogin('apple')}
          />
        </View>

        {/* Register link */}
        <Pressable
          style={styles.registerLink}
          onPress={() => router.push('/(auth)/register/email-password')}
          hitSlop={8}
        >
          <Text style={styles.registerText}>
            Chua co tai khoan?{' '}
            <Text style={styles.registerAccent}>Dang ky</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  title: {
    ...Typography.displayMd,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  fieldGap: {
    height: Spacing.lg,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  linkText: {
    ...Typography.bodyMd,
    color: Colors.text.accent,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 343,
    marginVertical: Spacing['2xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.default,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    paddingHorizontal: Spacing.lg,
  },
  socialButtons: {
    width: '100%',
    alignItems: 'center',
  },
  socialGap: {
    height: Spacing.md,
  },
  registerLink: {
    marginTop: Spacing['3xl'],
    padding: Spacing.sm,
  },
  registerText: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
  },
  registerAccent: {
    color: Colors.text.accent,
    fontWeight: '600',
  },
});
