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
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Layout } from '@/src/theme';
import { EasingCurves } from '@/src/theme/animations';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';

export default function ForgotPasswordSuccessScreen() {
  const insets = useSafeAreaInsets();

  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Checkmark animation
    checkOpacity.value = withTiming(1, { duration: 200 });
    checkScale.value = withTiming(1, {
      duration: 300,
      easing: EasingCurves.spring,
    });

    // Content fade in
    contentOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 400, easing: EasingCurves.decelerate })
    );

    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [checkScale, checkOpacity, contentOpacity]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleLogin = () => {
    // Navigate to welcome/login, clearing the forgot-password stack
    router.replace('/(auth)/welcome');
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 24 },
      ]}
    >
      {/* Success check animation */}
      <Animated.View style={[styles.checkContainer, checkStyle]}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkIcon}>{'\u2713'}</Text>
        </View>
      </Animated.View>

      {/* Content */}
      <Animated.View style={[styles.textContent, contentStyle]}>
        <Text style={styles.title}>Dat lai thanh cong!</Text>
        <Text style={styles.subtitle}>
          Mat khau cua ban da duoc cap nhat. Ban co the dang nhap voi mat khau moi.
        </Text>
      </Animated.View>

      <View style={styles.spacer} />

      {/* CTA */}
      <PrimaryButton label="Dang nhap ngay" onPress={handleLogin} />
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
  checkContainer: {
    marginBottom: Spacing['3xl'],
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.semantic.positiveSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 48,
    color: Colors.semantic.positive,
  },
  textContent: {
    alignItems: 'center',
  },
  title: {
    ...Typography.displayMd,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    lineHeight: 21,
  },
  spacer: {
    flex: 1,
  },
});
