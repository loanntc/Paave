import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Colors, Typography, BorderRadius } from '@/src/theme';

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
}: SecondaryButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 343,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    ...Typography.titleSm,
    color: Colors.text.secondary,
  },
  labelDisabled: {
    color: Colors.text.tertiary,
  },
});
