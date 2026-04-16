import { Stack } from 'expo-router';
import { Colors } from '@/src/theme';

export default function ForgotPasswordLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg.primary },
        animation: 'slide_from_right',
      }}
    />
  );
}
