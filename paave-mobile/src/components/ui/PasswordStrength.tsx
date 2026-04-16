import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography, Spacing } from '@/src/theme';

export interface PasswordStrengthProps {
  password: string;
}

interface Rule {
  label: string;
  test: (pw: string) => boolean;
}

const rules: Rule[] = [
  { label: 'It nhat 8 ky tu', test: (pw) => pw.length >= 8 },
  { label: 'Chu hoa (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Chu thuong (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { label: 'Chu so (0-9)', test: (pw) => /[0-9]/.test(pw) },
  { label: 'Ky tu dac biet (!@#$...)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const strengthLabels = ['', 'Yeu', 'Trung binh', 'Kha', 'Manh'];
const strengthColors = [
  Colors.border.default,
  Colors.semantic.negative,
  Colors.semantic.warning,
  Colors.accent.primary,
  Colors.semantic.positive,
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const passedRules = useMemo(
    () => rules.map((r) => r.test(password)),
    [password]
  );

  const passedCount = passedRules.filter(Boolean).length;

  // Map 0-5 rules passed to 0-4 strength level
  const strength = password.length === 0 ? 0 : Math.min(Math.floor((passedCount / rules.length) * 4) + (passedCount > 0 ? 1 : 0), 4);

  if (!password) return null;

  return (
    <View style={styles.container}>
      {/* Strength bar: 4 segments */}
      <View style={styles.barRow}>
        {[1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[
              styles.barSegment,
              {
                backgroundColor:
                  level <= strength
                    ? strengthColors[strength]
                    : Colors.border.default,
              },
            ]}
          />
        ))}
      </View>
      <Text
        style={[styles.strengthLabel, { color: strengthColors[strength] }]}
      >
        {strengthLabels[strength]}
      </Text>

      {/* Rules checklist */}
      <View style={styles.rules}>
        {rules.map((rule, index) => (
          <View key={index} style={styles.ruleRow}>
            <Text
              style={[
                styles.ruleCheck,
                {
                  color: passedRules[index]
                    ? Colors.semantic.positive
                    : Colors.text.tertiary,
                },
              ]}
            >
              {passedRules[index] ? '\u2713' : '\u2022'}
            </Text>
            <Text
              style={[
                styles.ruleText,
                {
                  color: passedRules[index]
                    ? Colors.text.secondary
                    : Colors.text.tertiary,
                },
              ]}
            >
              {rule.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 343,
    alignSelf: 'center',
    marginTop: Spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    gap: 4,
  },
  barSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  rules: {
    marginTop: Spacing.sm,
    gap: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleCheck: {
    fontSize: 14,
    width: 16,
    textAlign: 'center',
  },
  ruleText: {
    ...Typography.caption,
  },
});
