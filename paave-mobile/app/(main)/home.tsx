import React, { useState, useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors, Typography, Spacing, Layout, BorderRadius } from '@/src/theme';
import { BiometricPrompt } from '@/src/components/modals/BiometricPrompt';
import type { BiometricType } from '@/src/components/modals/BiometricPrompt';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('face');

  // Check if biometric prompt should be shown (first login)
  useEffect(() => {
    checkBiometricPrompt();
  }, []);

  const checkBiometricPrompt = async () => {
    try {
      // TODO: Check if user has already set up biometric
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return;

      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        setBiometricType('face');
      } else {
        setBiometricType('fingerprint');
      }

      // TODO: Only show if biometric not yet configured
      // For now, we show it as a demo
      // setShowBiometricPrompt(true);
    } catch {
      // silently fail
    }
  };

  const handleEnableBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Xac nhan sinh trac hoc',
      });
      if (result.success) {
        // TODO: Store biometric preference
        setShowBiometricPrompt(false);
      }
    } catch {
      setShowBiometricPrompt(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Layout.bottomNavClearance,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Text style={styles.greeting}>Xin chao!</Text>
        <Text style={styles.subtitle}>Chao mung den voi Paave</Text>

        {/* Virtual balance hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Tong gia tri ao</Text>
          <Text style={styles.heroAmount}>500.000.000 VND</Text>
          <View style={styles.virtualBadge}>
            <Text style={styles.virtualBadgeText}>
              Tien ao - Khong su dung tien that
            </Text>
          </View>
        </View>

        {/* Quick actions placeholder */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bat dau giao dich thu</Text>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{'\uD83D\uDCC8'}</Text>
          <Text style={styles.emptyTitle}>Chua co gi o day</Text>
          <Text style={styles.emptySubtitle}>
            Kham pha co phieu va them vao danh sach theo doi
          </Text>
        </View>
      </ScrollView>

      {/* Biometric prompt modal */}
      <BiometricPrompt
        visible={showBiometricPrompt}
        onEnable={handleEnableBiometric}
        onSkip={() => setShowBiometricPrompt(false)}
        biometricType={biometricType}
      />
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
  greeting: {
    ...Typography.displayMd,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    marginBottom: Spacing['3xl'],
  },
  heroCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
    marginBottom: Spacing['3xl'],
  },
  heroLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  heroAmount: {
    ...Typography.displayLg,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  virtualBadge: {
    backgroundColor: Colors.banner.virtualBg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.banner.virtualBorder,
  },
  virtualBadgeText: {
    ...Typography.caption,
    color: Colors.banner.virtualText,
  },
  sectionHeader: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleMd,
    color: Colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.titleSm,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
});
