import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle, useColorScheme } from 'react-native';
import { getPalette, radius, shadows, spacing } from '@/src/constants/theme';

export function SurfaceCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const palette = getPalette(useColorScheme());

  return <View style={[styles.card, shadows.card, { backgroundColor: palette.surface, borderColor: palette.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
});
