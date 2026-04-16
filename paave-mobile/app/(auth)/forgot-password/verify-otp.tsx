import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Layout } from '@/src/theme';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { OTPInput } from '@/src/components/ui/OTPInput';
import { useToast } from '@/src/components/providers/ToastProvider';

const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordVerifyOTPScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [otpError, setOtpError] = useState('');
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [loading, setLoading] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPComplete = useCallback(
    async (code: string) => {
      setLoading(true);
      setOtpError('');
      try {
        // TODO: Call API to verify reset OTP
        router.push('/(auth)/forgot-password/new-password');
      } catch {
        setOtpError('Ma xac nhan khong dung');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleResend = useCallback(() => {
    if (resendCooldown > 0) return;
    // TODO: Call API to resend
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    setTimeLeft(OTP_EXPIRY_SECONDS);
    setOtpError('');
    showToast('Ma moi da duoc gui', 'success');
  }, [resendCooldown, showToast]);

  return (
    <View style={styles.container}>
      <ScreenHeader onBack={() => router.back()} />

      <View
        style={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* Title */}
        <Text style={styles.title}>Nhap ma xac nhan</Text>
        <Text style={styles.subtitle}>
          Ma 6 chu so da gui den email cua ban
        </Text>

        {/* Timer */}
        <Text
          style={[styles.timer, timeLeft <= 60 && styles.timerWarning]}
        >
          Ma hop le trong {formatTime(timeLeft)}
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
            error={otpError}
            disabled={loading || timeLeft <= 0}
          />
        </View>

        {/* Resend */}
        <Pressable
          style={styles.resendButton}
          onPress={handleResend}
          disabled={resendCooldown > 0}
        >
          <Text
            style={[
              styles.resendText,
              resendCooldown > 0 && styles.resendTextDisabled,
            ]}
          >
            {resendCooldown > 0
              ? `Gui lai ma trong ${resendCooldown}s`
              : 'Gui lai ma'}
          </Text>
        </Pressable>

        {/* Expired */}
        {timeLeft <= 0 && (
          <Text style={styles.expiredText}>
            Ma da het han. Gui lai ma moi.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
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
    marginBottom: Spacing.lg,
  },
  timer: {
    ...Typography.caption,
    color: Colors.text.accent,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  timerWarning: {
    color: Colors.semantic.warning,
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  resendButton: {
    alignSelf: 'center',
    padding: Spacing.sm,
  },
  resendText: {
    ...Typography.bodyMd,
    color: Colors.text.accent,
  },
  resendTextDisabled: {
    color: Colors.text.tertiary,
  },
  expiredText: {
    ...Typography.bodyMd,
    color: Colors.text.negative,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
