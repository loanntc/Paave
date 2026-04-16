import React, { useState, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Layout } from '@/src/theme';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { TextInput } from '@/src/components/ui/TextInput';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useToast } from '@/src/components/providers/ToastProvider';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordEmailScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email), [email]);

  const handleSendCode = async () => {
    if (!isEmailValid) return;
    setLoading(true);
    try {
      // TODO: Call API to send reset code
      router.push('/(auth)/forgot-password/verify-otp');
    } catch {
      showToast('Khong the gui ma xac nhan. Thu lai sau.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          {/* Title */}
          <Text style={styles.title}>Quen mat khau</Text>
          <Text style={styles.subtitle}>
            Nhap email da dang ky de nhan ma xac nhan
          </Text>

          {/* Email input */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoFocus
            />
          </View>

          <View style={styles.spacer} />

          {/* CTA */}
          <PrimaryButton
            label="Gui ma xac nhan"
            onPress={handleSendCode}
            disabled={!isEmailValid}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
  },
  title: {
    ...Typography.titleLg,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    marginBottom: Spacing['3xl'],
  },
  inputContainer: {
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
});
