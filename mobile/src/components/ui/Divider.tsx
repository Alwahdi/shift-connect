import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/config/theme';

interface DividerProps {
  spacing?: number;
}

export const Divider: React.FC<DividerProps> = ({ spacing = Spacing.base }) => {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.borderLight, marginVertical: spacing }]} />;
};

const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth * 2, width: '100%' },
});
