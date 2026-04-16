import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Layout, BorderRadius } from '@/src/theme';
import { EasingCurves } from '@/src/theme/animations';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { ProgressDots } from '@/src/components/ui/ProgressDots';

export default function CompleteScreen() {
  const insets = useSafeAreaInsets();

  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate check icon
    checkOpacity.value = withTiming(1, { duration: 300 });
    checkScale.value = withTiming(1, {
      duration: 300,
      easing: EasingCurves.spring,
    });

    // Fade in content
    contentOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 400, easing: EasingCurves.decelerate })
    );
  }, [checkOpacity, checkScale, contentOpacity]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleStart = () => {
    // Navigate to main app, replacing the auth stack
    router.replace('/(main)/home');
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 56,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        {/* Progress dots: step 5 of 5 (complete) */}
        <View style={styles.dotsContainer}>
          <ProgressDots total={5} current={4} />
        </View>

        {/* Success check */}
        <Animated.View style={[styles.checkContainer, checkStyle]}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>{'\u2713'}</Text>
          </View>
        </Animated.View>

        {/* Welcome content */}
        <Animated.View style={[styles.textContent, contentStyle]}>
          <Text style={styles.title}>Chao mung ban!</Text>
          <Text style={styles.subtitle}>
            Tai khoan cua ban da duoc tao thanh cong
          </Text>

          {/* Virtual balance card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>So du ao cua ban</Text>
            <Text style={styles.balanceAmount}>500.000.000 VND</Text>
            <Text style={styles.balanceNote}>
              Tien ao - Khong su dung tien that
            </Text>
          </View>

          {/* Feature highlights */}
          <View style={styles.features}>
            <FeatureItem text="Giao dich thu voi 500 trieu VND ao" />
            <FeatureItem text="Theo doi co phieu yeu thich" />
            <FeatureItem text="Hoc cach dau tu thong minh" />
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        {/* CTA */}
        <PrimaryButton label="Bat dau kham pha" onPress={handleStart} />
      </View>
    </View>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureCheck}>{'\u2713'}</Text>
      <Text style={styles.featureText}>{text}</Text>
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
    alignItems: 'center',
  },
  dotsContainer: {
    marginBottom: Spacing['3xl'],
  },
  checkContainer: {
    marginBottom: Spacing['3xl'],
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.semantic.positiveSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 40,
    color: Colors.semantic.positive,
  },
  textContent: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    ...Typography.displayMd,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    marginBottom: Spacing['3xl'],
    textAlign: 'center',
  },
  balanceCard: {
    width: 343,
    backgroundColor: Colors.bg.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.banner.virtualBorder,
    marginBottom: Spacing['3xl'],
  },
  balanceLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    ...Typography.displayLg,
    color: Colors.semantic.positive,
    marginBottom: Spacing.sm,
  },
  balanceNote: {
    ...Typography.caption,
    color: Colors.banner.virtualText,
  },
  features: {
    width: '100%',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureCheck: {
    fontSize: 16,
    color: Colors.semantic.positive,
  },
  featureText: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
});
