import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

import { theme } from '@/src/constants/theme';

type CardProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

export function Card({ style, ...props }: CardProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
});
