import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/src/constants/theme';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'muted';

export function Badge({ label, variant = 'muted' }: { label: string; variant?: BadgeVariant }) {
  return (
    <View style={[styles.base, variantStyles[variant]]}>
      <Text style={[styles.text, textStyles[variant]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radii.round,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.heading,
    fontWeight: '700',
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: '#EEE8F0' },
  accent: { backgroundColor: '#E7F1F4' },
  success: { backgroundColor: '#E7F7EF' },
  warning: { backgroundColor: '#FFF5E5' },
  error: { backgroundColor: '#FEEBEC' },
  muted: { backgroundColor: '#F1F5F9' },
});

const textStyles = StyleSheet.create({
  primary: { color: theme.colors.primary },
  accent: { color: theme.colors.accent },
  success: { color: theme.colors.success },
  warning: { color: theme.colors.warning },
  error: { color: theme.colors.error },
  muted: { color: theme.colors.muted },
});
