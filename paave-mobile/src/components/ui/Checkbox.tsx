import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/src/theme';

export interface CheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label: string;
  required?: boolean;
  linkText?: string;
  onLinkPress?: () => void;
}

export function Checkbox({
  checked,
  onToggle,
  label,
  required,
  linkText,
  onLinkPress,
}: CheckboxProps) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => onToggle(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      hitSlop={4}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Text style={styles.checkmark}>{'\u2713'}</Text>}
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {linkText && onLinkPress && (
          <Pressable onPress={onLinkPress} hitSlop={8}>
            <Text style={styles.link}>{linkText}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44, // minimum touch target
    paddingVertical: Spacing.sm,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.border.default,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  boxChecked: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  labelContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  label: {
    ...Typography.bodyMd,
    color: Colors.text.primary,
  },
  required: {
    color: Colors.text.negative,
  },
  link: {
    ...Typography.bodyMd,
    color: Colors.text.accent,
    marginTop: 2,
    textDecorationLine: 'underline',
  },
});
