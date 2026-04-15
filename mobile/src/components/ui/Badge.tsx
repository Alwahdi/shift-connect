import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, typography } from "@/constants/theme";

interface BadgeProps {
  children: string;
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
  size?: "sm" | "md";
}

const VARIANT_STYLES: Record<string, { bg: string; text: string }> = {
  default: { bg: colors.primaryBg, text: colors.primary },
  success: { bg: colors.successBg, text: colors.success },
  warning: { bg: colors.warningBg, text: colors.warning },
  error: { bg: colors.errorBg, text: colors.error },
  info: { bg: colors.tealBg, text: colors.teal },
  outline: { bg: "transparent", text: colors.textSecondary },
};

export default function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  const v = VARIANT_STYLES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, variant === "outline" && styles.outline, size === "md" && styles.md]}>
      <Text style={[styles.text, { color: v.text }, size === "md" && styles.mdText]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full, alignSelf: "flex-start" },
  outline: { borderWidth: 1, borderColor: colors.border },
  md: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  text: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },
  mdText: { fontSize: typography.sizes.sm },
});
