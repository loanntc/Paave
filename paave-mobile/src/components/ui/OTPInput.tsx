import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, BorderRadius, Spacing } from '@/src/theme';
import { AnimationPresets, Duration, EasingCurves } from '@/src/theme/animations';

export interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  autoFocus?: boolean;
  error?: string;
  disabled?: boolean;
}

export function OTPInput({
  length = 6,
  onComplete,
  autoFocus = true,
  error,
  disabled = false,
}: OTPInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Trigger shake on error
  useEffect(() => {
    if (error) {
      const sequence = AnimationPresets.errorShake.sequence;
      shakeX.value = withSequence(
        ...sequence.map((val) =>
          withTiming(val, {
            duration: AnimationPresets.errorShake.duration / sequence.length,
          })
        )
      );
      // Clear code on error
      setCode(Array(length).fill(''));
      setFocusedIndex(0);
      inputRefs.current[0]?.focus();
    }
  }, [error, length, shakeX]);

  const handleChange = useCallback(
    (text: string, index: number) => {
      if (disabled) return;

      // Handle paste (multiple characters)
      if (text.length > 1) {
        const digits = text.replace(/\D/g, '').split('').slice(0, length);
        const newCode = Array(length).fill('');
        digits.forEach((d, i) => {
          newCode[i] = d;
        });
        setCode(newCode);
        if (digits.length === length) {
          onComplete(newCode.join(''));
        } else {
          const nextIndex = Math.min(digits.length, length - 1);
          setFocusedIndex(nextIndex);
          inputRefs.current[nextIndex]?.focus();
        }
        return;
      }

      const digit = text.replace(/\D/g, '');
      const newCode = [...code];
      newCode[index] = digit;
      setCode(newCode);

      if (digit && index < length - 1) {
        // Auto-advance to next box
        setFocusedIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when last digit is entered
      if (digit && index === length - 1) {
        const fullCode = newCode.join('');
        if (fullCode.length === length) {
          onComplete(fullCode);
        }
      }
    },
    [code, disabled, length, onComplete]
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace' && !code[index] && index > 0) {
        // Move back on backspace if current box is empty
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        setFocusedIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    },
    [code]
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.boxRow, shakeStyle]}>
        {Array.from({ length }).map((_, index) => {
          const isFocused = focusedIndex === index;
          const hasValue = !!code[index];
          const hasError = !!error;

          return (
            <Pressable
              key={index}
              onPress={() => {
                inputRefs.current[index]?.focus();
                setFocusedIndex(index);
              }}
            >
              <View
                style={[
                  styles.box,
                  hasError && styles.boxError,
                  isFocused && !hasError && styles.boxFocused,
                  disabled && styles.boxDisabled,
                ]}
              >
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.boxText}
                  value={code[index]}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  onFocus={() => setFocusedIndex(index)}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? length : 1}
                  autoFocus={autoFocus && index === 0}
                  editable={!disabled}
                  selectTextOnFocus
                  accessibilityLabel={`So thu ${index + 1}`}
                />
              </View>
            </Pressable>
          );
        })}
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  boxRow: {
    flexDirection: 'row',
    gap: 8,
  },
  box: {
    width: 44,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocused: {
    borderColor: Colors.border.focus,
    borderWidth: 2,
  },
  boxError: {
    borderColor: Colors.border.error,
    borderWidth: 2,
  },
  boxDisabled: {
    opacity: 0.5,
  },
  boxText: {
    ...Typography.displayMd,
    color: Colors.text.primary,
    textAlign: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 0,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.text.negative,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
