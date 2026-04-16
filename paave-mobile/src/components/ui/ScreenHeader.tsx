import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Layout } from '@/src/theme';

export interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, rightAction }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {onBack ? (
          <Pressable
            style={styles.backButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Quay lai"
            hitSlop={8}
          >
            <Text style={styles.backIcon}>{'\u2039'}</Text>
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}

        {title && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}

        {rightAction ? (
          <View style={styles.rightAction}>{rightAction}</View>
        ) : (
          <View style={styles.backButton} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg.primary,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    width: Layout.minTouchTarget,
    height: Layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: Colors.text.primary,
    lineHeight: 36,
  },
  title: {
    ...Typography.titleLg,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
    maxWidth: 200,
  },
  rightAction: {
    width: Layout.minTouchTarget,
    height: Layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
