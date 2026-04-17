import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing, Typography } from '@/config/theme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', size = 'sm', style }) => {
  const { colors } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'success': return { bg: colors.success + '20', text: colors.success };
      case 'warning': return { bg: colors.warning + '20', text: colors.warning };
      case 'error': return { bg: colors.error + '20', text: colors.error };
      case 'info': return { bg: colors.info + '20', text: colors.info };
      case 'primary': return { bg: colors.primary + '20', text: colors.primary };
      default: return { bg: colors.surfaceVariant, text: colors.textSecondary };
    }
  };

  const { bg, text: textColor } = getColors();

  return (
    <View style={[
      styles.badge,
      { backgroundColor: bg },
      size === 'sm' ? styles.sm : styles.md,
      style,
    ]}>
      <Text style={[styles.text, { color: textColor }, size === 'sm' ? styles.textSm : styles.textMd]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  sm: { paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  md: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  text: { fontWeight: Typography.weights.semibold },
  textSm: { fontSize: Typography.sizes.xs },
  textMd: { fontSize: Typography.sizes.sm },
});
