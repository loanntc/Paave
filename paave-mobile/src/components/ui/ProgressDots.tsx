import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors, BorderRadius } from '@/src/theme';
import { Duration, EasingCurves } from '@/src/theme/animations';

export interface ProgressDotsProps {
  total: number;
  current: number;
}

function Dot({ isActive }: { isActive: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(isActive ? 24 : 8, {
      duration: Duration.fast,
      easing: EasingCurves.spring,
    }),
    backgroundColor: withTiming(
      isActive ? Colors.accent.primary : Colors.bg.card,
      { duration: Duration.fast }
    ),
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <Dot key={index} isActive={index === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: BorderRadius.full,
  },
});
