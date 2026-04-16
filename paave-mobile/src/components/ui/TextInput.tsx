import React, { useState, useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, BorderRadius, Spacing } from '@/src/theme';
import { Duration, EasingCurves } from '@/src/theme/animations';

export interface TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  rightIcon?: React.ReactNode;
  autoFocus?: boolean;
  maxLength?: number;
  editable?: boolean;
}

export function TextInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType,
  rightIcon,
  autoFocus,
  maxLength,
  editable = true,
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const labelPosition = useSharedValue(value ? 1 : 0);

  const animatedLabelStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(labelPosition.value === 1 ? -12 : 4, {
          duration: Duration.fast,
          easing: EasingCurves.standard,
        }),
      },
    ],
    fontSize: withTiming(labelPosition.value === 1 ? 12 : 16, {
      duration: Duration.fast,
      easing: EasingCurves.standard,
    }),
  }));

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    labelPosition.value = 1;
  }, [labelPosition]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!value) {
      labelPosition.value = 0;
    }
  }, [value, labelPosition]);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const borderColor = error
    ? Colors.border.error
    : isFocused
    ? Colors.border.focus
    : Colors.border.default;

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { borderColor }]}>
        <Animated.Text
          style={[
            styles.floatingLabel,
            animatedLabelStyle,
            {
              color: error
                ? Colors.text.negative
                : isFocused
                ? Colors.text.accent
                : Colors.text.tertiary,
            },
          ]}
        >
          {label}
        </Animated.Text>
        <RNTextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={isFocused ? placeholder : undefined}
          placeholderTextColor={Colors.text.tertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          maxLength={maxLength}
          editable={editable}
          accessibilityLabel={label}
          accessibilityState={{ disabled: !editable }}
        />
        {secureTextEntry ? (
          <Pressable
            style={styles.iconButton}
            onPress={togglePasswordVisibility}
            accessibilityLabel={
              isPasswordVisible ? 'An mat khau' : 'Hien mat khau'
            }
            hitSlop={8}
          >
            <Text style={styles.eyeIcon}>
              {isPasswordVisible ? '\u25C9' : '\u25CE'}
            </Text>
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.iconButton}>{rightIcon}</View>
        ) : null}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 343,
    alignSelf: 'center',
  },
  inputContainer: {
    height: 56,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  floatingLabel: {
    position: 'absolute',
    left: Spacing.lg,
    top: 16,
    color: Colors.text.tertiary,
    ...Typography.bodyMd,
  },
  input: {
    flex: 1,
    ...Typography.bodyLg,
    color: Colors.text.primary,
    paddingTop: 14,
    height: '100%',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  eyeIcon: {
    fontSize: 20,
    color: Colors.text.tertiary,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.text.negative,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
