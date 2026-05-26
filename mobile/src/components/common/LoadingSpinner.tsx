import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/src/constants/theme';

export function LoadingSpinner({ label = 'Loading...', fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  label: {
    color: theme.colors.muted,
  },
});
