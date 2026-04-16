import React, { useState, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Layout } from '@/src/theme';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { ProgressDots } from '@/src/components/ui/ProgressDots';
import { TextInput } from '@/src/components/ui/TextInput';
import { PasswordStrength } from '@/src/components/ui/PasswordStrength';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useToast } from '@/src/components/providers/ToastProvider';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

export default function EmailPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email), [email]);
  const isPasswordValid = useMemo(() => PASSWORD_REGEX.test(password), [password]);
  const doPasswordsMatch = useMemo(
    () => password === confirmPassword && confirmPassword.length > 0,
    [password, confirmPassword]
  );

  const isFormValid = isEmailValid && isPasswordValid && doPasswordsMatch;

  const handleEmailBlur = () => {
    if (email && !isEmailValid) {
      setEmailError('Dia chi email khong hop le');
    } else {
      setEmailError('');
    }
  };

  const handleConfirmBlur = () => {
    if (confirmPassword && !doPasswordsMatch) {
      setConfirmError('Mat khau xac nhan khong khop');
    } else {
      setConfirmError('');
    }
  };

  const handleNext = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      // TODO: Call API to check if email is available
      router.push('/(auth)/register/verify-otp');
    } catch {
      showToast('Da ton tai tai khoan voi email nay', 'error');
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
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress dots: step 1 of 5 */}
          <View style={styles.dotsContainer}>
            <ProgressDots total={5} current={0} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Tao tai khoan</Text>
          <Text style={styles.subtitle}>
            Nhap email va mat khau de bat dau
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              placeholder="email@example.com"
              keyboardType="email-address"
              error={emailError}
            />

            <View style={styles.fieldGap} />

            <TextInput
              label="Mat khau"
              value={password}
              onChangeText={setPassword}
              placeholder="It nhat 8 ky tu"
              secureTextEntry
            />
            <PasswordStrength password={password} />

            <View style={styles.fieldGap} />

            <TextInput
              label="Xac nhan mat khau"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmError) setConfirmError('');
              }}
              placeholder="Nhap lai mat khau"
              secureTextEntry
              error={confirmError}
            />
          </View>

          {/* CTA */}
          <PrimaryButton
            label="Tiep theo"
            onPress={handleNext}
            disabled={!isFormValid}
            loading={loading}
          />
        </ScrollView>
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
    paddingHorizontal: Layout.screenPadding,
  },
  dotsContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  title: {
    ...Typography.titleLg,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    marginBottom: Spacing['3xl'],
  },
  form: {
    marginBottom: Spacing['3xl'],
    alignItems: 'center',
  },
  fieldGap: {
    height: Spacing.lg,
  },
});
