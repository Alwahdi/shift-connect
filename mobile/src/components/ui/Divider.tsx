import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/constants/theme';

interface DividerProps {
  marginVertical?: number;
}

export const Divider: React.FC<DividerProps> = ({ marginVertical = spacing.base }) => {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border, marginVertical }]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
