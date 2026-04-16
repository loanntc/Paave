import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { EasingCurves } from '@/src/theme/animations';

export default function SplashScreen() {
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo in
    logoOpacity.value = withTiming(1, {
      duration: 600,
      easing: EasingCurves.decelerate,
    });
    logoTranslateY.value = withTiming(0, {
      duration: 600,
      easing: EasingCurves.decelerate,
    });

    // Tagline fades in after 400ms
    taglineOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 400, easing: EasingCurves.decelerate })
    );

    // Navigate after splash display
    const timer = setTimeout(() => {
      // TODO: Check auth state. For now, always go to welcome
      router.replace('/(auth)/welcome');
    }, 1800);

    return () => clearTimeout(timer);
  }, [logoOpacity, logoTranslateY, taglineOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.center, logoStyle]}>
        {/* Logo mark */}
        <View style={styles.logoMark}>
          <Text style={styles.logoIcon}>P</Text>
        </View>

        {/* Wordmark */}
        <Text style={styles.wordmark}>Paave</Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Dau tu thong minh hon
        </Animated.Text>
      </Animated.View>

      {/* Version number */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  wordmark: {
    ...Typography.displayMd,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    letterSpacing: -0.5,
  },
  tagline: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  version: {
    ...Typography.label,
    color: Colors.text.tertiary,
    position: 'absolute',
    bottom: 32,
  },
});
