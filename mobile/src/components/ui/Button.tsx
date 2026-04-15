import React from "react";
import { Pressable, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, spacing, borderRadius, typography, TOUCH_TARGET } from "@/constants/theme";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function Button({ children, onPress, variant = "primary", size = "md", loading, disabled, fullWidth, icon, style }: ButtonProps) {
  const bgColors: Record<string, string> = {
    primary: colors.primary, secondary: colors.surfaceSecondary, outline: "transparent",
    ghost: "transparent", destructive: colors.error,
  };
  const textColors: Record<string, string> = {
    primary: colors.white, secondary: colors.text, outline: colors.primary,
    ghost: colors.text, destructive: colors.white,
  };
  const heights: Record<string, number> = { sm: 36, md: TOUCH_TARGET, lg: 52 };
  const fontSizes: Record<string, number> = { sm: typography.sizes.sm, md: typography.sizes.base, lg: typography.sizes.md };

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bgColors[variant], height: heights[size], opacity: (disabled || loading) ? 0.5 : pressed ? 0.8 : 1 },
        variant === "outline" && { borderWidth: 1.5, borderColor: colors.primary },
        fullWidth && { width: "100%" as any },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColors[variant], fontSize: fontSizes[size] }]}>
            {typeof children === "string" ? children : children}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingHorizontal: spacing.lg, borderRadius: borderRadius.DEFAULT, gap: spacing.sm,
  },
  text: { fontWeight: typography.weights.semibold },
});
