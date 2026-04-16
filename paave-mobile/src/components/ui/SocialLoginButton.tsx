import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, Typography, BorderRadius } from '@/src/theme';

export type SocialProvider = 'google' | 'apple';

export interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  loading?: boolean;
}

const providerConfig: Record<
  SocialProvider,
  { label: string; bgColor: string; textColor: string; icon: string }
> = {
  google: {
    label: 'Google',
    bgColor: Colors.bg.card,
    textColor: Colors.text.primary,
    icon: 'G',
  },
  apple: {
    label: 'Apple',
    bgColor: '#000000',
    textColor: '#FFFFFF',
    icon: '\uF8FF', // Apple logo placeholder
  },
};

export function SocialLoginButton({
  provider,
  onPress,
  loading = false,
}: SocialLoginButtonProps) {
  const config = providerConfig[provider];

  return (
    <Pressable
      style={[styles.button, { backgroundColor: config.bgColor }]}
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={`Tiep tuc voi ${config.label}`}
    >
      {loading ? (
        <ActivityIndicator color={config.textColor} size="small" />
      ) : (
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={[styles.iconText, { color: config.textColor }]}>
              {config.icon}
            </Text>
          </View>
          <Text style={[styles.label, { color: config.textColor }]}>
            Tiep tuc voi {config.label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 343,
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    ...Typography.titleSm,
  },
});
