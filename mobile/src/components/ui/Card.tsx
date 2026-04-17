import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing, Shadows } from '@/config/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children, onPress, style, variant = 'default', padding = 'md',
}) => {
  const { colors } = useTheme();

  const getPaddingValue = () => {
    switch (padding) {
      case 'none': return 0;
      case 'sm': return Spacing.sm;
      case 'md': return Spacing.base;
      case 'lg': return Spacing.xl;
      default: return Spacing.base;
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated': return { ...Shadows.md, backgroundColor: colors.card };
      case 'outlined': return { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card };
      default: return { ...Shadows.sm, backgroundColor: colors.card };
    }
  };

  const content = (
    <View style={[styles.card, getVariantStyle(), { padding: getPaddingValue() }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
});
