/**
 * Button component for React Native.
 *
 * Supports variants (default, destructive, outline, ghost, link),
 * sizes (sm, default, lg), haptic feedback, and loading state.
 */
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";

const COLORS = {
  primary: "#663C6D",
  primaryFg: "#FFFFFF",
  destructive: "#DC2626",
  destructiveFg: "#FFFFFF",
  border: "#E2E8F0",
  foreground: "#2D1F33",
  muted: "#64748B",
};

type Variant = "default" | "destructive" | "outline" | "ghost" | "link";
type Size = "sm" | "default" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  variant = "default",
  size = "default",
  loading = false,
  children,
  onPress,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const variantStyles: Record<Variant, ViewStyle> = {
    default: { backgroundColor: COLORS.primary },
    destructive: { backgroundColor: COLORS.destructive },
    outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORS.border },
    ghost: { backgroundColor: "transparent" },
    link: { backgroundColor: "transparent" },
  };

  const sizeStyles: Record<Size, ViewStyle> = {
    sm: { minHeight: 36, paddingHorizontal: 12 },
    default: { minHeight: 44, paddingHorizontal: 16 },
    lg: { minHeight: 52, paddingHorizontal: 24 },
  };

  const textColor =
    variant === "default" ? COLORS.primaryFg
    : variant === "destructive" ? COLORS.destructiveFg
    : variant === "link" ? COLORS.primary
    : COLORS.foreground;

  return (
    <Pressable
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : typeof children === "string" ? (
        <Text style={[styles.text, { color: textColor }]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
