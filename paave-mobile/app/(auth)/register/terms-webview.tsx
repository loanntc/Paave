import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Colors, Typography, Spacing } from '@/src/theme';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { useToast } from '@/src/components/providers/ToastProvider';

const WEBVIEW_URLS: Record<string, { title: string; url: string }> = {
  tos: {
    title: 'Dieu khoan su dung',
    url: 'https://paave.com/terms',
  },
  privacy: {
    title: 'Chinh sach bao mat',
    url: 'https://paave.com/privacy',
  },
};

export default function TermsWebviewScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const config = WEBVIEW_URLS[type || 'tos'] || WEBVIEW_URLS.tos;

  const handleError = () => {
    setHasError(true);
    setLoading(false);
    showToast('Khong the tai. Kiem tra ket noi.', 'error');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={config.title} onBack={() => router.back()} />

      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Khong the tai noi dung. Vui long kiem tra ket noi mang va thu lai.
          </Text>
        </View>
      ) : (
        <>
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator color={Colors.accent.primary} size="large" />
            </View>
          )}
          <WebView
            source={{ uri: config.url }}
            style={styles.webview}
            onLoadEnd={() => setLoading(false)}
            onError={handleError}
            onHttpError={handleError}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg.primary,
    zIndex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  errorText: {
    ...Typography.bodyMd,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
