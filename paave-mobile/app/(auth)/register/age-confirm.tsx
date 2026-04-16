import React, { useState, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Typography, Spacing, Layout, BorderRadius } from '@/src/theme';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { ProgressDots } from '@/src/components/ui/ProgressDots';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useToast } from '@/src/components/providers/ToastProvider';

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function AgeConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [ageError, setAgeError] = useState('');

  const age = useMemo(
    () => (dateOfBirth ? calculateAge(dateOfBirth) : null),
    [dateOfBirth]
  );

  const isValid = age !== null && age >= 13;

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
      const calculatedAge = calculateAge(selectedDate);
      if (calculatedAge < 13) {
        setAgeError('Paave yeu cau nguoi dung tu 13 tuoi tro len.');
      } else {
        setAgeError('');
      }
    }
  };

  const handleNext = () => {
    if (!isValid) return;
    if (age! < 13) {
      showToast('Ban chua du tuoi su dung Paave', 'error');
      router.replace('/(auth)/welcome');
      return;
    }
    // Proceed to terms
    router.push('/(auth)/register/terms');
  };

  const today = new Date();
  const maxDate = today;
  const minDate = new Date(1900, 0, 1);

  return (
    <View style={styles.container}>
      <ScreenHeader onBack={() => router.back()} />

      <View
        style={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* Progress dots: step 3 of 5 */}
        <View style={styles.dotsContainer}>
          <ProgressDots total={5} current={2} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Ngay sinh cua ban</Text>
        <Text style={styles.subtitle}>
          Chung toi can xac nhan tuoi cua ban de dam bao an toan
        </Text>

        {/* Date Picker Trigger (Android) */}
        {Platform.OS === 'android' && (
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
          >
            <Text
              style={[
                styles.dateButtonText,
                !dateOfBirth && styles.dateButtonPlaceholder,
              ]}
            >
              {dateOfBirth ? formatDate(dateOfBirth) : 'Chon ngay sinh'}
            </Text>
          </Pressable>
        )}

        {/* Date Picker */}
        {showPicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={dateOfBirth || new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={maxDate}
              minimumDate={minDate}
              themeVariant="dark"
            />
          </View>
        )}

        {/* Age display */}
        {age !== null && (
          <Text style={[styles.ageText, ageError && styles.ageTextError]}>
            {ageError || `Ban ${age} tuoi`}
          </Text>
        )}

        {/* Help text */}
        {age !== null && age >= 16 && age < 18 && (
          <Text style={styles.helpText}>
            Tai khoan cua ban se o che do hoc tap cho den khi du 18 tuoi
          </Text>
        )}

        <View style={styles.spacer} />

        {/* CTA */}
        <PrimaryButton
          label="Tiep theo"
          onPress={handleNext}
          disabled={!isValid}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
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
  dateButton: {
    width: 343,
    height: 56,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  dateButtonText: {
    ...Typography.bodyLg,
    color: Colors.text.primary,
  },
  dateButtonPlaceholder: {
    color: Colors.text.tertiary,
  },
  pickerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  ageText: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  ageTextError: {
    color: Colors.text.negative,
  },
  helpText: {
    ...Typography.caption,
    color: Colors.semantic.warning,
    textAlign: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  spacer: {
    flex: 1,
  },
});
