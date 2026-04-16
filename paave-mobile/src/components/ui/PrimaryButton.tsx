import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, BorderRadius, Shadows, Layout } from '@/src/theme';
import { Duration, EasingCurves } from '@/src/theme/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled && !loading) {
      scale.value = withTiming(0.97, {
        duration: Duration.instant,
        easing: EasingCurves.sharp,
      });
    }
  }, [disabled, loading, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: Duration.fast,
      easing: EasingCurves.spring,
    });
  }, [scale]);

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      style={[
        styles.button,
        isDisabled ? styles.buttonDisabled : styles.buttonEnabled,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={Colors.text.primary} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text
            style={[
              styles.label,
              isDisabled ? styles.labelDisabled : styles.labelEnabled,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 343,
    height: Layout.buttonHeight,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  buttonEnabled: {
    backgroundColor: Colors.accent.primary,
    ...Shadows.glowAccent,
  },
  buttonDisabled: {
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    ...Typography.titleSm,
  },
  labelEnabled: {
    color: '#FFFFFF',
  },
  labelDisabled: {
    color: Colors.text.tertiary,
  },
});
