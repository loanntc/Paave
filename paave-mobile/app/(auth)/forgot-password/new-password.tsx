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
import { TextInput } from '@/src/components/ui/TextInput';
import { PasswordStrength } from '@/src/components/ui/PasswordStrength';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useToast } from '@/src/components/providers/ToastProvider';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

export default function NewPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const isPasswordValid = useMemo(
    () => PASSWORD_REGEX.test(password),
    [password]
  );
  const doPasswordsMatch = useMemo(
    () => password === confirmPassword && confirmPassword.length > 0,
    [password, confirmPassword]
  );

  const isFormValid = isPasswordValid && doPasswordsMatch;

  const handleConfirmBlur = () => {
    if (confirmPassword && !doPasswordsMatch) {
      setConfirmError('Mat khau xac nhan khong khop');
    } else {
      setConfirmError('');
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      // TODO: Call API to reset password
      router.push('/(auth)/forgot-password/success');
    } catch {
      showToast('Khong the dat lai mat khau. Thu lai sau.', 'error');
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
          {/* Title */}
          <Text style={styles.title}>Mat khau moi</Text>
          <Text style={styles.subtitle}>
            Tao mat khau moi cho tai khoan cua ban
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Mat khau moi"
              value={password}
              onChangeText={setPassword}
              placeholder="It nhat 8 ky tu"
              secureTextEntry
              autoFocus
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

          <View style={styles.spacer} />

          {/* CTA */}
          <PrimaryButton
            label="Dat lai mat khau"
            onPress={handleSubmit}
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
    flexGrow: 1,
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
  form: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  fieldGap: {
    height: Spacing.lg,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing['3xl'],
  },
});
