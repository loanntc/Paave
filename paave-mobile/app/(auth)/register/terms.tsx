import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Layout } from '@/src/theme';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { ProgressDots } from '@/src/components/ui/ProgressDots';
import { Checkbox } from '@/src/components/ui/Checkbox';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);

  const isFormValid = tosAccepted && privacyAccepted;

  const handleNext = () => {
    if (!isFormValid) return;
    // TODO: Store consent state
    router.push('/(auth)/register/complete');
  };

  const openTermsWebview = (type: 'tos' | 'privacy') => {
    router.push({
      pathname: '/(auth)/register/terms-webview',
      params: { type },
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader onBack={() => router.back()} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress dots: step 4 of 5 */}
        <View style={styles.dotsContainer}>
          <ProgressDots total={5} current={3} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Dieu khoan su dung</Text>
        <Text style={styles.subtitle}>
          Vui long doc va dong y cac dieu khoan truoc khi tiep tuc
        </Text>

        {/* Checkboxes */}
        <View style={styles.checkboxes}>
          <Checkbox
            checked={tosAccepted}
            onToggle={setTosAccepted}
            label="Toi dong y voi Dieu khoan su dung"
            required
            linkText="Doc dieu khoan"
            onLinkPress={() => openTermsWebview('tos')}
          />

          <Checkbox
            checked={privacyAccepted}
            onToggle={setPrivacyAccepted}
            label="Toi dong y voi Chinh sach bao mat"
            required
            linkText="Doc chinh sach"
            onLinkPress={() => openTermsWebview('privacy')}
          />

          <Checkbox
            checked={marketingAccepted}
            onToggle={setMarketingAccepted}
            label="Nhan thong tin khuyen mai va cap nhat san pham"
          />
        </View>

        {/* Hint when required checkboxes not checked */}
        {!isFormValid && (tosAccepted || privacyAccepted || marketingAccepted) && (
          <Text style={styles.hint}>
            Vui long dong y Dieu khoan su dung va Chinh sach bao mat de tiep tuc
          </Text>
        )}

        <View style={styles.spacer} />

        {/* CTA */}
        <PrimaryButton
          label="Tiep theo"
          onPress={handleNext}
          disabled={!isFormValid}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    flexGrow: 1,
  },
  dotsContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  title: {
    ...Typography.titleLg,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    marginBottom: Spacing['3xl'],
  },
  checkboxes: {
    gap: Spacing.sm,
  },
  hint: {
    ...Typography.caption,
    color: Colors.semantic.warning,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
    minHeight: Spacing['3xl'],
  },
});
