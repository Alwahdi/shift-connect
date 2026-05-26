import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { theme } from '@/src/constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'fab';

type ButtonProps = PressableProps & {
  title?: string;
  children?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  children,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth,
  leftIcon,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white} />
      ) : (
        <View style={styles.content}>
          {leftIcon}
          {children ?? <Text style={[styles.text, textVariantStyles[variant]]}>{title}</Text>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 48,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  text: {
    fontFamily: theme.typography.heading,
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
  },
  sm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 40,
  },
  md: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  lg: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 54,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: theme.radii.round,
    ...theme.shadows.card,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.65,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  outline: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
  },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: theme.colors.white },
  secondary: { color: theme.colors.white },
  outline: { color: theme.colors.primary },
  ghost: { color: theme.colors.primary },
  danger: { color: theme.colors.white },
});
