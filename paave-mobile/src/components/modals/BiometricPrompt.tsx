import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/src/theme';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { SecondaryButton } from '@/src/components/ui/SecondaryButton';

export type BiometricType = 'face' | 'fingerprint';

export interface BiometricPromptProps {
  visible: boolean;
  onEnable: () => void;
  onSkip: () => void;
  biometricType: BiometricType;
}

const biometricConfig: Record<
  BiometricType,
  { icon: string; title: string; description: string }
> = {
  face: {
    icon: '\uD83D\uDC64', // face placeholder
    title: 'Bat dang nhap bang Face ID?',
    description:
      'Truy cap nhanh hon voi Face ID. Ban luon co the dang nhap bang mat khau.',
  },
  fingerprint: {
    icon: '\uD83D\uDD12', // lock placeholder
    title: 'Bat dang nhap bang van tay?',
    description:
      'Truy cap nhanh hon voi van tay. Ban luon co the dang nhap bang mat khau.',
  },
};

export function BiometricPrompt({
  visible,
  onEnable,
  onSkip,
  biometricType,
}: BiometricPromptProps) {
  const config = biometricConfig[biometricType];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Shield icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.shieldIcon}>{'\uD83D\uDEE1'}</Text>
          </View>

          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.description}>{config.description}</Text>

          <View style={styles.buttons}>
            <PrimaryButton label="Bat" onPress={onEnable} />
            <View style={styles.buttonGap} />
            <SecondaryButton label="De sau" onPress={onSkip} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.bg.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 343,
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.xl,
    padding: Spacing['3xl'],
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  shieldIcon: {
    fontSize: 40,
  },
  title: {
    ...Typography.titleLg,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing['3xl'],
    lineHeight: 21,
  },
  buttons: {
    width: '100%',
  },
  buttonGap: {
    height: Spacing.md,
  },
});
