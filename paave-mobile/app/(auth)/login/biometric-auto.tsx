import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Layout, BorderRadius } from '@/src/theme';
import { EasingCurves, Duration } from '@/src/theme/animations';
import { useToast } from '@/src/components/providers/ToastProvider';

const MAX_ATTEMPTS = 3;

export default function BiometricAutoScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [status, setStatus] = useState<'scanning' | 'success' | 'failed'>(
    'scanning'
  );
  const [attempts, setAttempts] = useState(0);

  const pulseScale = useSharedValue(1);

  // Pulse animation while scanning
  useEffect(() => {
    if (status === 'scanning') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: EasingCurves.standard }),
          withTiming(1, { duration: 1000, easing: EasingCurves.standard })
        ),
        -1,
        true
      );
    }
  }, [status, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Auto-trigger biometric on mount
  useEffect(() => {
    authenticate();
  }, []);

  const authenticate = async () => {
    setStatus('scanning');

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        showToast('Thiet bi khong ho tro sinh trac hoc', 'error');
        router.replace('/(auth)/welcome');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        showToast('Chua cai dat sinh trac hoc tren thiet bi', 'error');
        router.replace('/(auth)/welcome');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Dang nhap vao Paave',
        fallbackLabel: 'Dung mat khau',
        disableDeviceFallback: true,
      });

      if (result.success) {
        setStatus('success');
        // Brief success state before navigating
        setTimeout(() => {
          router.replace('/(main)/home');
        }, 500);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setStatus('failed');
          showToast(
            'Xac thuc sinh trac hoc that bai. Vui long dang nhap bang mat khau.',
            'error'
          );
          // Delay then navigate to fallback
          setTimeout(() => {
            router.replace('/(auth)/welcome');
          }, 2000);
        } else {
          setStatus('scanning');
          // Auto-retry after short delay
          setTimeout(() => authenticate(), 500);
        }
      }
    } catch {
      setStatus('failed');
      router.replace('/(auth)/welcome');
    }
  };

  const statusConfig = {
    scanning: {
      icon: '\uD83D\uDC64',
      text: 'Dang xac thuc...',
      color: Colors.accent.primary,
    },
    success: {
      icon: '\u2713',
      text: 'Xac thuc thanh cong!',
      color: Colors.semantic.positive,
    },
    failed: {
      icon: '\u2717',
      text: 'Xac thuc that bai',
      color: Colors.semantic.negative,
    },
  };

  const config = statusConfig[status];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.center}>
        {/* Biometric icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            { borderColor: config.color },
            status === 'scanning' && pulseStyle,
          ]}
        >
          <Text style={[styles.icon, { color: config.color }]}>
            {config.icon}
          </Text>
        </Animated.View>

        {/* Status text */}
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.text}
        </Text>

        {/* Attempt counter */}
        {status === 'scanning' && attempts > 0 && (
          <Text style={styles.attemptText}>
            Lan thu {attempts + 1}/{MAX_ATTEMPTS}
          </Text>
        )}
      </View>

      {/* Fallback link */}
      <Pressable
        style={styles.fallbackButton}
        onPress={() => router.replace('/(auth)/welcome')}
        hitSlop={8}
      >
        <Text style={styles.fallbackText}>Dang nhap bang mat khau</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Layout.screenPadding,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    backgroundColor: Colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
  },
  icon: {
    fontSize: 48,
  },
  statusText: {
    ...Typography.titleMd,
    marginBottom: Spacing.sm,
  },
  attemptText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  fallbackButton: {
    alignSelf: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  fallbackText: {
    ...Typography.bodyMd,
    color: Colors.text.accent,
  },
});
