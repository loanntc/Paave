import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '@/src/theme';
import { AnimationPresets, EasingCurves } from '@/src/theme/animations';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

const typeColors: Record<ToastType, string> = {
  success: Colors.semantic.positive,
  error: Colors.semantic.negative,
  info: Colors.accent.primary,
};

const typeIcons: Record<ToastType, string> = {
  success: '\u2713',
  error: '\u2717',
  info: '\u2139',
};

export function Toast({
  message,
  type = 'info',
  visible,
  onDismiss,
  duration = AnimationPresets.toastAutoDismiss,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 300,
        easing: EasingCurves.decelerate,
      });
      opacity.value = withTiming(1, { duration: 300 });

      // Auto-dismiss
      translateY.value = withDelay(
        duration,
        withTiming(-100, {
          duration: 250,
          easing: EasingCurves.accelerate,
        })
      );
      opacity.value = withDelay(
        duration,
        withTiming(0, { duration: 250 }, (finished) => {
          if (finished) {
            runOnJS(onDismiss)();
          }
        })
      );
    }
  }, [visible, duration, onDismiss, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + Spacing.sm },
        animatedStyle,
      ]}
    >
      <View style={[styles.toast, { borderLeftColor: typeColors[type] }]}>
        <Text style={[styles.icon, { color: typeColors[type] }]}>
          {typeIcons[type]}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: Colors.bg.card,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.cardRaised,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: Spacing.sm,
  },
  message: {
    ...Typography.bodyMd,
    color: Colors.text.primary,
    flex: 1,
  },
});
