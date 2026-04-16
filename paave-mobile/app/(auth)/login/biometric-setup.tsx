import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Layout, BorderRadius } from '@/src/theme';
import { EasingCurves } from '@/src/theme/animations';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { SecondaryButton } from '@/src/components/ui/SecondaryButton';
import { useToast } from '@/src/components/providers/ToastProvider';

type BiometricKind = 'face' | 'fingerprint' | 'none';

const biometricLabels: Record<BiometricKind, { title: string; description: string; icon: string }> = {
  face: {
    title: 'Bat Face ID',
    description: 'Dang nhap nhanh hon voi nhan dien khuon mat. Ban luon co the dang nhap bang mat khau.',
    icon: '\uD83D\uDC64',
  },
  fingerprint: {
    title: 'Bat van tay',
    description: 'Dang nhap nhanh hon voi van tay. Ban luon co the dang nhap bang mat khau.',
    icon: '\uD83D\uDD12',
  },
  none: {
    title: 'Sinh trac hoc',
    description: 'Thiet bi khong ho tro sinh trac hoc.',
    icon: '\u26A0',
  },
};

export default function BiometricSetupScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [biometricKind, setBiometricKind] = useState<BiometricKind>('none');
  const [loading, setLoading] = useState(false);

  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    checkBiometricType();
    contentOpacity.value = withTiming(1, {
      duration: 400,
      easing: EasingCurves.decelerate,
    });
  }, [contentOpacity]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const checkBiometricType = async () => {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricKind('face');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricKind('fingerprint');
      } else {
        setBiometricKind('none');
      }
    } catch {
      setBiometricKind('none');
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Xac nhan sinh trac hoc',
        fallbackLabel: 'Huy',
      });

      if (result.success) {
        // TODO: Store biometric preference in secure store
        showToast('Da bat sinh trac hoc!', 'success');
        router.replace('/(main)/home');
      } else {
        showToast('Khong the xac nhan sinh trac hoc', 'error');
      }
    } catch {
      showToast('Loi khi bat sinh trac hoc', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(main)/home');
  };

  if (biometricKind === 'none') {
    // Device has no biometric hardware — skip this step
    handleSkip();
    return null;
  }

  const config = biometricLabels[biometricKind];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Animated.View style={[styles.content, contentStyle]}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.description}>{config.description}</Text>

        {/* Biometric type indicator */}
        <View style={styles.typeChip}>
          <Text style={styles.typeText}>
            {Platform.OS === 'ios' ? 'Face ID' : 'Van tay'}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.spacer} />

      {/* CTA Buttons */}
      <View style={styles.buttons}>
        <PrimaryButton
          label="Bat"
          onPress={handleEnable}
          loading={loading}
        />
        <View style={styles.buttonGap} />
        <SecondaryButton label="De sau" onPress={handleSkip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Layout.screenPadding,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accent.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
  },
  icon: {
    fontSize: 48,
  },
  title: {
    ...Typography.displayMd,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
    lineHeight: 21,
  },
  typeChip: {
    backgroundColor: Colors.bg.card,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  typeText: {
    ...Typography.captionBold,
    color: Colors.text.accent,
  },
  spacer: {
    flex: 1,
  },
  buttons: {
    width: '100%',
    alignItems: 'center',
  },
  buttonGap: {
    height: Spacing.md,
  },
});
