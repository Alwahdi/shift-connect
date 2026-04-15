import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { spacing, borderRadius, shadows } from '@/constants/theme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  const { colors } = useTheme();

  const paddingValue = {
    none: 0,
    sm: spacing.md,
    md: spacing.base,
    lg: spacing.xl,
  }[padding];

  const cardStyle: ViewStyle[] = [
    styles.card,
    {
      backgroundColor: colors.card,
      padding: paddingValue,
    },
    variant === 'outlined' && { borderWidth: 1, borderColor: colors.cardBorder },
    variant === 'elevated' && { ...shadows.md, borderWidth: 0 },
    variant === 'default' && { borderWidth: 1, borderColor: colors.cardBorder, ...shadows.sm },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
});
